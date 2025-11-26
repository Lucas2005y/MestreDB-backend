import { AuthUseCases } from '../../../application/usecases/AuthUseCases';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { PasswordService } from '../../../application/services/PasswordService';
import { TokenService } from '../../../application/services/TokenService';
import { User } from '../../../domain/entities/User';

describe('AuthUseCases', () => {
  let authUseCases: AuthUseCases;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockTokenService: jest.Mocked<TokenService>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    is_superuser: false,
    last_login: null,
    last_access: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateLastLogin: jest.fn(),
      updateLastAccess: jest.fn(),
    } as any;

    mockPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      validatePasswordStrength: jest.fn(),
    } as any;

    mockTokenService = {
      generateTokenPair: jest.fn(),
      validateAccessToken: jest.fn(),
      validateRefreshToken: jest.fn(),
      refreshTokenPair: jest.fn(),
      revokeToken: jest.fn(),
    } as any;

    authUseCases = new AuthUseCases(
      mockUserRepository,
      mockPasswordService,
      mockTokenService
    );
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verifyPassword.mockResolvedValue(true);
      mockTokenService.generateTokenPair.mockReturnValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      const result = await authUseCases.login('test@example.com', 'password123');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith(
        'password123',
        mockUser.password
      );
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveProperty('token', 'access_token');
      expect(result).toHaveProperty('refreshToken', 'refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('deve rejeitar email inexistente', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authUseCases.login('naoexiste@example.com', 'password123')
      ).rejects.toThrow('Credenciais inválidas');

      expect(mockPasswordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('deve rejeitar senha incorreta', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.verifyPassword.mockResolvedValue(false);

      await expect(
        authUseCases.login('test@example.com', 'senhaErrada')
      ).rejects.toThrow('Credenciais inválidas');

      expect(mockTokenService.generateTokenPair).not.toHaveBeenCalled();
    });

    it('deve rejeitar email vazio', async () => {
      await expect(authUseCases.login('', 'password123')).rejects.toThrow();
    });

    it('deve rejeitar senha vazia', async () => {
      await expect(authUseCases.login('test@example.com', '')).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('deve registrar novo usuário', async () => {
      const registerData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'StrongP@ss123',
        is_superuser: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue('hashed_password');
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockTokenService.generateTokenPair.mockReturnValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      const result = await authUseCases.register(
        registerData.name,
        registerData.email,
        registerData.password,
        registerData.is_superuser
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerData.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(registerData.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('deve rejeitar email duplicado', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authUseCases.register('New User', 'existing@example.com', 'password', false)
      ).rejects.toThrow('Email já está em uso');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar dados inválidos', async () => {
      await expect(
        authUseCases.register('', 'invalid', '123', false)
      ).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('deve renovar tokens com refresh token válido', async () => {
      const refreshToken = 'valid_refresh_token';
      const decoded = { userId: 1, email: 'test@example.com', is_superuser: false };

      mockTokenService.validateRefreshToken.mockReturnValue(decoded as any);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.refreshTokenPair.mockReturnValue({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });

      const result = await authUseCases.refreshToken(refreshToken);

      expect(mockTokenService.validateRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(decoded.userId);
      expect(result).toHaveProperty('token', 'new_access_token');
      expect(result).toHaveProperty('refreshToken', 'new_refresh_token');
    });

    it('deve rejeitar refresh token inválido', async () => {
      mockTokenService.validateRefreshToken.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(authUseCases.refreshToken('invalid_token')).rejects.toThrow(
        'Token inválido'
      );
    });

    it('deve rejeitar se usuário não existe mais', async () => {
      const decoded = { userId: 999, email: 'test@example.com', is_superuser: false };
      mockTokenService.validateRefreshToken.mockReturnValue(decoded as any);
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authUseCases.refreshToken('valid_token')).rejects.toThrow(
        'Usuário não encontrado'
      );
    });
  });

  describe('validateToken', () => {
    it('deve validar token válido', async () => {
      const token = 'valid_token';
      const decoded = { userId: 1, email: 'test@example.com', is_superuser: false };

      mockTokenService.validateAccessToken.mockReturnValue(decoded as any);

      const result = await authUseCases.validateToken(token);

      expect(mockTokenService.validateAccessToken).toHaveBeenCalledWith(token);
      expect(result).toEqual(decoded);
    });

    it('deve rejeitar token inválido', async () => {
      mockTokenService.validateAccessToken.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await expect(authUseCases.validateToken('invalid_token')).rejects.toThrow(
        'Token inválido'
      );
    });
  });

  describe('logout', () => {
    it('deve fazer logout revogando token', async () => {
      const token = 'valid_token';

      mockTokenService.revokeToken.mockImplementation(() => {});

      await authUseCases.logout(token);

      expect(mockTokenService.revokeToken).toHaveBeenCalledWith(token);
    });

    it('deve lidar com erro ao revogar token', async () => {
      mockTokenService.revokeToken.mockImplementation(() => {
        throw new Error('Erro ao revogar');
      });

      await expect(authUseCases.logout('token')).rejects.toThrow('Erro ao revogar');
    });
  });
});
