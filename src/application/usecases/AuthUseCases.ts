import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { PasswordService } from '../services/PasswordService';
import { TokenService, TokenPayload } from '../services/TokenService';

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



export class AuthUseCases {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService
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

    // Gerar tokens usando TokenService
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      is_superuser: user.is_superuser
    });

    return {
      token: accessToken,
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

    // Gerar tokens usando TokenService
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      is_superuser: newUser.is_superuser
    });

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
    return this.tokenService.validateAccessToken(token);
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Validar refresh token usando TokenService
    const decoded = this.tokenService.validateRefreshToken(refreshToken);
    
    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Gerar novos tokens usando TokenService
    const { accessToken, refreshToken: newRefreshToken } = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      is_superuser: user.is_superuser
    });

    return {
      token: accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_superuser: user.is_superuser
      }
    };
  }

  async logout(token: string): Promise<void> {
    // Usar TokenService para revogar token (validação + futuro blacklisting)
    this.tokenService.revokeToken(token);
    // Token será invalidado naturalmente quando expirar
  }
}