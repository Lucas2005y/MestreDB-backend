import { TokenService, UserTokenData } from '../../../application/services/TokenService';
import { TokenBlacklistService } from '../../../application/services/TokenBlacklistService';

describe('TokenService', () => {
  let tokenService: TokenService;
  let tokenBlacklistService: TokenBlacklistService;
  let mockUserData: UserTokenData;

  beforeEach(() => {
    tokenBlacklistService = new TokenBlacklistService();
    tokenService = new TokenService(tokenBlacklistService);

    mockUserData = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      is_superuser: false,
    };
  });

  describe('generateAccessToken', () => {
    it('deve gerar access token válido', () => {
      const token = tokenService.generateAccessToken(mockUserData);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT tem 3 partes
    });

    it('deve incluir dados do usuário no token', () => {
      const token = tokenService.generateAccessToken(mockUserData);
      const payload = tokenService.getTokenPayload(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockUserData.id);
      expect(payload?.name).toBe(mockUserData.name);
      expect(payload?.email).toBe(mockUserData.email);
      expect(payload?.is_superuser).toBe(mockUserData.is_superuser);
      expect(payload?.type).toBe('access');
    });

    it('deve gerar tokens diferentes para o mesmo usuário', () => {
      const token1 = tokenService.generateAccessToken(mockUserData);
      const token2 = tokenService.generateAccessToken(mockUserData);

      expect(token1).not.toBe(token2); // iat diferente
    });
  });

  describe('generateRefreshToken', () => {
    it('deve gerar refresh token válido', () => {
      const token = tokenService.generateRefreshToken(mockUserData);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('deve marcar token como tipo refresh', () => {
      const token = tokenService.generateRefreshToken(mockUserData);
      const payload = tokenService.getTokenPayload(token);

      expect(payload?.type).toBe('refresh');
    });
  });

  describe('generateTokenPair', () => {
    it('deve gerar par de tokens', () => {
      const { accessToken, refreshToken } = tokenService.generateTokenPair(mockUserData);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessToken).not.toBe(refreshToken);
    });

    it('deve gerar tokens com tipos corretos', () => {
      const { accessToken, refreshToken } = tokenService.generateTokenPair(mockUserData);

      const accessPayload = tokenService.getTokenPayload(accessToken);
      const refreshPayload = tokenService.getTokenPayload(refreshToken);

      expect(accessPayload?.type).toBe('access');
      expect(refreshPayload?.type).toBe('refresh');
    });
  });

  describe('validateAccessToken', () => {
    it('deve validar access token válido', () => {
      const token = tokenService.generateAccessToken(mockUserData);

      const payload = tokenService.validateAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(mockUserData.id);
      expect(payload.type).toBe('access');
    });

    it('deve rejeitar token inválido', () => {
      const invalidToken = 'token.invalido.aqui';

      expect(() => tokenService.validateAccessToken(invalidToken)).toThrow('Token inválido');
    });

    it('deve rejeitar refresh token como access token', () => {
      const refreshToken = tokenService.generateRefreshToken(mockUserData);

      expect(() => tokenService.validateAccessToken(refreshToken)).toThrow('tipo incorreto');
    });
  });

  describe('validateRefreshToken', () => {
    it('deve validar refresh token válido', () => {
      const token = tokenService.generateRefreshToken(mockUserData);

      const payload = tokenService.validateRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(mockUserData.id);
      expect(payload.type).toBe('refresh');
    });

    it('deve rejeitar access token como refresh token', () => {
      const accessToken = tokenService.generateAccessToken(mockUserData);

      expect(() => tokenService.validateRefreshToken(accessToken)).toThrow('inválido');
    });
  });

  describe('validateToken', () => {
    it('deve validar qualquer token válido', () => {
      const accessToken = tokenService.generateAccessToken(mockUserData);
      const refreshToken = tokenService.generateRefreshToken(mockUserData);

      expect(() => tokenService.validateToken(accessToken)).not.toThrow();
      expect(() => tokenService.validateToken(refreshToken)).not.toThrow();
    });

    it('deve rejeitar token inválido', () => {
      expect(() => tokenService.validateToken('invalid')).toThrow();
    });
  });

  describe('getTokenPayload', () => {
    it('deve extrair payload de token válido', () => {
      const token = tokenService.generateAccessToken(mockUserData);
      const payload = tokenService.getTokenPayload(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockUserData.id);
      expect(payload?.email).toBe(mockUserData.email);
    });

    it('deve retornar null para token inválido', () => {
      const payload = tokenService.getTokenPayload('invalid.token.here');

      expect(payload).toBeNull();
    });
  });

  describe('refreshTokenPair', () => {
    it('deve gerar novos tokens com refresh token válido', () => {
      const { refreshToken } = tokenService.generateTokenPair(mockUserData);

      const newTokens = tokenService.refreshTokenPair(refreshToken, mockUserData);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
    });

    it('deve rejeitar refresh token inválido', () => {
      expect(() =>
        tokenService.refreshTokenPair('invalid', mockUserData)
      ).toThrow();
    });
  });

  describe('getTokenConfig', () => {
    it('deve retornar configuração dos tokens', () => {
      const config = tokenService.getTokenConfig();

      expect(config).toHaveProperty('accessTokenExpiresIn');
      expect(config).toHaveProperty('refreshTokenExpiresIn');
      expect(config).toHaveProperty('secretConfigured');
      expect(config.secretConfigured).toBe(true);
    });
  });
});
