import { UserUseCases } from '../../../application/usecases/UserUseCases';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { PasswordService } from '../../../application/services/PasswordService';
import { User } from '../../../domain/entities/User';

describe('UserUseCases', () => {
  let userUseCases: UserUseCases;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;

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
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateLastLogin: jest.fn(),
      updateLastAccess: jest.fn(),
    } as any;

    mockPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      validatePasswordStrength: jest.fn(),
    } as any;

    userUseCases = new UserUseCases(mockUserRepository, mockPasswordService);
  });

  describe('createUser', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'StrongP@ss123',
        is_superuser: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue('hashed_password');
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userUseCases.createUser(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).not.toHaveProperty('password');
    });

    it('deve rejeitar email duplicado', async () => {
      const userData = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'StrongP@ss123',
        is_superuser: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userUseCases.createUser(userData)).rejects.toThrow('Email já está em uso');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('deve rejeitar dados inválidos', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123',
        is_superuser: false,
      };

      await expect(userUseCases.createUser(invalidData)).rejects.toThrow('Dados inválidos');
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário existente', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userUseCases.getUserById(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result).not.toHaveProperty('password');
    });

    it('deve retornar null para usuário inexistente', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userUseCases.getUserById(999);

      expect(result).toBeNull();
    });

    it('deve rejeitar ID inválido', async () => {
      await expect(userUseCases.getUserById(0)).rejects.toThrow('ID inválido');
      await expect(userUseCases.getUserById(-1)).rejects.toThrow('ID inválido');
    });
  });

  describe('getAllUsers', () => {
    it('deve listar usuários com paginação', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 2, email: 'user2@example.com' }];
      mockUserRepository.findAll.mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      const result = await userUseCases.getAllUsers({ page: 1, limit: 10 });

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toHaveProperty('page', 1);
      expect(result.pagination).toHaveProperty('total', 2);
      expect(result.pagination).toHaveProperty('hasNext', false);
      expect(result.pagination).toHaveProperty('hasPrev', false);
    });

    it('deve validar parâmetros de paginação', async () => {
      mockUserRepository.findAll.mockResolvedValue({ users: [], total: 0 });

      const result = await userUseCases.getAllUsers({ page: -1, limit: 200 });

      // Deve corrigir valores inválidos
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(1, 100); // Corrigido
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      mockUserRepository.findAll.mockResolvedValue({ users: [], total: 0 });

      const result = await userUseCases.getAllUsers({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('updateUser', () => {
    it('deve atualizar usuário existente', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await userUseCases.updateUser(1, updateData);

      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(result?.name).toBe('Updated Name');
    });

    it('deve rejeitar email duplicado na atualização', async () => {
      const updateData = {
        email: 'existing@example.com',
      };

      const otherUser = { ...mockUser, id: 2, email: 'existing@example.com' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(otherUser);

      await expect(userUseCases.updateUser(1, updateData)).rejects.toThrow('Email já está em uso');
    });

    it('deve permitir manter o mesmo email', async () => {
      const updateData = {
        name: 'Updated Name',
        email: mockUser.email, // Mesmo email
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(mockUser); // Mesmo usuário
      mockUserRepository.update.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await userUseCases.updateUser(1, updateData);

      expect(result).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('deve retornar null para usuário inexistente', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userUseCases.updateUser(999, { name: 'Test' });

      expect(result).toBeNull();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('deve deletar usuário existente', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userUseCases.deleteUser(1);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false para usuário inexistente', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userUseCases.deleteUser(999);

      expect(result).toBe(false);
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('deve rejeitar ID inválido', async () => {
      await expect(userUseCases.deleteUser(0)).rejects.toThrow('ID inválido');
    });
  });
});
