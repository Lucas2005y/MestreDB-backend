import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { PasswordService } from '../services/PasswordService';
import { sign, verify, JsonWebTokenError, TokenExpiredError, SignOptions } from 'jsonwebtoken';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  is_superuser: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    is_superuser: boolean;
  };
}

export interface TokenPayload {
  userId: number;
  email: string;
  is_superuser: boolean;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export class AuthUseCases {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'mestredb-secret-key-2024';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService
  ) {}

  async login(loginData: LoginDTO): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Validar dados de entrada
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Buscar usuário por email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Atualizar last_login
    await this.userRepository.updateLastLogin(user.id);

    // Gerar tokens
    const accessTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      is_superuser: user.is_superuser,
      type: 'access'
    };

    const refreshTokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      is_superuser: user.is_superuser,
      type: 'refresh'
    };

    const token = sign(accessTokenPayload, this.JWT_SECRET as string, { expiresIn: this.JWT_EXPIRES_IN } as SignOptions);
    const refreshToken = sign(refreshTokenPayload, this.JWT_SECRET as string, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_superuser: user.is_superuser
      }
    };
  }

  async register(registerData: RegisterDTO): Promise<AuthResponse> {
    const { name, email, password, is_superuser } = registerData;

    // Validar dados de entrada
    if (!name || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    // Validar força da senha
    const passwordValidation = this.passwordService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
    }

    // Verificar se o email já existe
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já existe');
    }

    // Hash da senha
    const hashedPassword = await this.passwordService.hashPassword(password);

    // Criar usuário
    const newUser = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      is_superuser
    });

    // Gerar tokens
    const accessTokenPayload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      is_superuser: newUser.is_superuser,
      type: 'access'
    };

    const refreshTokenPayload: TokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      is_superuser: newUser.is_superuser,
      type: 'refresh'
    };

    const accessToken = sign(accessTokenPayload, this.JWT_SECRET as string, { expiresIn: this.JWT_EXPIRES_IN } as SignOptions);
    const refreshToken = sign(refreshTokenPayload, this.JWT_SECRET as string, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_superuser: newUser.is_superuser
      }
    };
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = verify(token, this.JWT_SECRET as string) as TokenPayload;
      
      // Verificar se é um access token
      if (decoded.type !== 'access') {
        throw new Error('Token inválido: tipo incorreto');
      }

      return decoded;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new Error('Token inválido');
      }
      if (error instanceof TokenExpiredError) {
        throw new Error('Token expirado');
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = verify(refreshToken, this.JWT_SECRET as string) as TokenPayload;
      
      // Verificar se é um refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Refresh token inválido');
      }
      
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gerar novos tokens
      const accessTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        is_superuser: user.is_superuser,
        type: 'access'
      };

      const refreshTokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        is_superuser: user.is_superuser,
        type: 'refresh'
      };

      const newToken = sign(accessTokenPayload, this.JWT_SECRET as string, { expiresIn: this.JWT_EXPIRES_IN } as SignOptions);
      const newRefreshToken = sign(refreshTokenPayload, this.JWT_SECRET as string, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as SignOptions);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_superuser: user.is_superuser
        }
      };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      }
      if (error instanceof TokenExpiredError) {
        throw new Error('Refresh token expirado');
      }
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    // Em uma implementação mais robusta, você poderia adicionar o token a uma blacklist
    // Por enquanto, apenas validamos se o token é válido
    await this.validateToken(token);
    // Token será invalidado naturalmente quando expirar
  }
}