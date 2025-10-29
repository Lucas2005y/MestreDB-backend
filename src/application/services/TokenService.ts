import { sign, verify, JsonWebTokenError, TokenExpiredError, SignOptions } from 'jsonwebtoken';
import { TokenBlacklistService } from './TokenBlacklistService';

export interface TokenPayload {
  userId: number;
  email: string;
  is_superuser: boolean;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserTokenData {
  id: number;
  email: string;
  is_superuser: boolean;
}

export class TokenService {
  private readonly JWT_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;
  private tokenBlacklistService: TokenBlacklistService;

  constructor(tokenBlacklistService: TokenBlacklistService) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'mestredb-secret-key-2024';
    this.ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
    this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    this.tokenBlacklistService = tokenBlacklistService;
  }

  /**
   * Gera um access token para o usuário
   */
  generateAccessToken(userData: UserTokenData): string {
    const payload: TokenPayload = {
      userId: userData.id,
      email: userData.email,
      is_superuser: userData.is_superuser,
      type: 'access'
    };

    return sign(payload, this.JWT_SECRET, { 
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN 
    } as SignOptions);
  }

  /**
   * Gera um refresh token para o usuário
   */
  generateRefreshToken(userData: UserTokenData): string {
    const payload: TokenPayload = {
      userId: userData.id,
      email: userData.email,
      is_superuser: userData.is_superuser,
      type: 'refresh'
    };

    return sign(payload, this.JWT_SECRET, { 
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN 
    } as SignOptions);
  }

  /**
   * Gera um par de tokens (access + refresh) para o usuário
   */
  generateTokenPair(userData: UserTokenData): TokenPair {
    return {
      accessToken: this.generateAccessToken(userData),
      refreshToken: this.generateRefreshToken(userData)
    };
  }

  /**
   * Valida um access token e retorna o payload
   */
  validateAccessToken(token: string): TokenPayload {
    try {
      const decoded = verify(token, this.JWT_SECRET) as TokenPayload;
      
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

  /**
   * Valida um refresh token e retorna o payload
   */
  validateRefreshToken(token: string): TokenPayload {
    try {
      const decoded = verify(token, this.JWT_SECRET) as TokenPayload;
      
      // Verificar se é um refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Refresh token inválido');
      }

      return decoded;
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

  /**
   * Valida qualquer token e retorna o payload (sem verificar tipo)
   */
  validateToken(token: string): TokenPayload {
    try {
      return verify(token, this.JWT_SECRET) as TokenPayload;
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

  /**
   * Verifica se um token está expirado sem lançar exceção
   */
  isTokenExpired(token: string): boolean {
    try {
      verify(token, this.JWT_SECRET);
      return false;
    } catch (error) {
      return error instanceof TokenExpiredError;
    }
  }

  /**
   * Extrai o payload de um token sem validar assinatura ou expiração
   */
  getTokenPayload(token: string): TokenPayload | null {
    try {
      // Decodifica sem verificar assinatura (apenas para extrair dados)
      const decoded = verify(token, this.JWT_SECRET, { ignoreExpiration: true }) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Gera novos tokens baseado em um refresh token válido
   */
  refreshTokenPair(refreshToken: string, userData: UserTokenData): TokenPair {
    // Primeiro valida o refresh token
    this.validateRefreshToken(refreshToken);
    
    // Se válido, gera novo par de tokens
    return this.generateTokenPair(userData);
  }

  /**
   * Revoga um token adicionando-o à blacklist
   */
  revokeToken(token: string): void {
    // Valida se o token é válido antes de revogar
    this.validateToken(token);
    
    // Adiciona o token à blacklist
    this.tokenBlacklistService.addToBlacklist(token);
  }

  /**
   * Obtém informações de configuração dos tokens
   */
  getTokenConfig() {
    return {
      accessTokenExpiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      refreshTokenExpiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      secretConfigured: !!this.JWT_SECRET
    };
  }
}