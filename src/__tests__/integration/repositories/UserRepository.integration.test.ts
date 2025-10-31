import { User } from '../../../domain/entities/User';
import { CreateUserData, UpdateUserData } from '../../../domain/interfaces/IUserRepository';
import { TestDataSource, initializeTestDatabase, destroyTestDatabase, clearTestDatabase } from '../setup';
import { UserRepositoryTestAdapter } from './UserRepository.test.adapter';

describe('UserRepository Integration Tests', () => {
  let userRepository: UserRepositoryTestAdapter;

  beforeAll(async () => {
    await initializeTestDatabase();
    userRepository = new UserRepositoryTestAdapter(TestDataSource);
  });

  afterAll(async () => {
    await destroyTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };

      const createdUser = await userRepository.create(userData);

      expect(createdUser).toBeInstanceOf(User);
      expect(createdUser.name).toBe(userData.name);
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.password).toBe(userData.password);
      expect(createdUser.is_superuser).toBe(userData.is_superuser);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.created_at).toBeInstanceOf(Date);
      expect(createdUser.updated_at).toBeInstanceOf(Date);
    });

    it('should create a superuser successfully', async () => {
      const userData: CreateUserData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedPassword123',
        is_superuser: true
      };

      const createdUser = await userRepository.create(userData);

      expect(createdUser.is_superuser).toBe(true);
    });

    it('should fail when creating user with duplicate email', async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };

      // Criar primeiro usuário
      await userRepository.create(userData);

      // Tentar criar segundo usuário com mesmo email
      const duplicateUserData: CreateUserData = {
        name: 'João Santos',
        email: 'joao@example.com', // Email duplicado
        password: 'hashedPassword456',
        is_superuser: false
      };

      await expect(userRepository.create(duplicateUserData)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    let createdUser: User;

    beforeEach(async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };
      createdUser = await userRepository.create(userData);
    });

    it('should find user by ID successfully', async () => {
      const foundUser = await userRepository.findById(createdUser.id);

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.name).toBe(createdUser.name);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null when user does not exist', async () => {
      const foundUser = await userRepository.findById(999);

      expect(foundUser).toBeNull();
    });

    it('should return null for invalid ID', async () => {
      const foundUser = await userRepository.findById(0);

      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmail', () => {
    let createdUser: User;

    beforeEach(async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };
      createdUser = await userRepository.create(userData);
    });

    it('should find user by email successfully', async () => {
      const foundUser = await userRepository.findByEmail('joao@example.com');

      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.email).toBe(createdUser.email);
    });

    it('should return null when email does not exist', async () => {
      const foundUser = await userRepository.findByEmail('inexistente@example.com');

      expect(foundUser).toBeNull();
    });

    it('should be case sensitive for email search', async () => {
      const foundUser = await userRepository.findByEmail('JOAO@EXAMPLE.COM');

      expect(foundUser).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Criar múltiplos usuários para teste de paginação
      const users = [
        { name: 'João Silva', email: 'joao@example.com', password: 'hash1', is_superuser: false },
        { name: 'Maria Santos', email: 'maria@example.com', password: 'hash2', is_superuser: true },
        { name: 'Pedro Oliveira', email: 'pedro@example.com', password: 'hash3', is_superuser: false },
        { name: 'Ana Costa', email: 'ana@example.com', password: 'hash4', is_superuser: false },
        { name: 'Carlos Lima', email: 'carlos@example.com', password: 'hash5', is_superuser: false }
      ];

      for (const userData of users) {
        await userRepository.create(userData);
      }
    });

    it('should return all users with default pagination', async () => {
      const result = await userRepository.findAll();

      expect(result.users).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.users[0]).toBeInstanceOf(User);
    });

    it('should return users with custom pagination', async () => {
      const result = await userRepository.findAll(1, 3);

      expect(result.users).toHaveLength(3);
      expect(result.total).toBe(5);
    });

    it('should return second page correctly', async () => {
      const result = await userRepository.findAll(2, 3);

      expect(result.users).toHaveLength(2); // Restantes da segunda página
      expect(result.total).toBe(5);
    });

    it('should return empty array when page exceeds total', async () => {
      const result = await userRepository.findAll(10, 10);

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(5);
    });

    it('should order users by created_at DESC', async () => {
      const result = await userRepository.findAll();

      // O último usuário criado deve ser o primeiro na lista
      expect(result.users[0].name).toBe('Carlos Lima');
      expect(result.users[4].name).toBe('João Silva');
    });
  });

  describe('update', () => {
    let createdUser: User;

    beforeEach(async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };
      createdUser = await userRepository.create(userData);
    });

    it('should update user name successfully', async () => {
      const updateData: UpdateUserData = {
        name: 'João Santos'
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser).toBeInstanceOf(User);
      expect(updatedUser?.name).toBe('João Santos');
      expect(updatedUser?.email).toBe(createdUser.email); // Não alterado
      expect(updatedUser?.updated_at.getTime()).toBeGreaterThan(createdUser.updated_at.getTime());
    });

    it('should update user email successfully', async () => {
      const updateData: UpdateUserData = {
        email: 'joao.santos@example.com'
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser?.email).toBe('joao.santos@example.com');
      expect(updatedUser?.name).toBe(createdUser.name); // Não alterado
    });

    it('should update user password successfully', async () => {
      const updateData: UpdateUserData = {
        password: 'newHashedPassword456'
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser?.password).toBe('newHashedPassword456');
    });

    it('should update multiple fields successfully', async () => {
      const updateData: UpdateUserData = {
        name: 'João Santos',
        email: 'joao.santos@example.com',
        password: 'newHashedPassword456'
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser?.name).toBe('João Santos');
      expect(updatedUser?.email).toBe('joao.santos@example.com');
      expect(updatedUser?.password).toBe('newHashedPassword456');
    });

    it('should return null when user does not exist', async () => {
      const updateData: UpdateUserData = {
        name: 'Nome Inexistente'
      };

      const updatedUser = await userRepository.update(999, updateData);

      expect(updatedUser).toBeNull();
    });

    it('should update updated_at field', async () => {
      const originalUpdatedAt = createdUser.updated_at;

      // Aguardar um pouco para garantir diferença de tempo
      await new Promise(resolve => setTimeout(resolve, 10));

      const updateData: UpdateUserData = {
        name: 'João Santos'
      };

      const updatedUser = await userRepository.update(createdUser.id, updateData);

      expect(updatedUser?.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('delete', () => {
    let createdUser: User;

    beforeEach(async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };
      createdUser = await userRepository.create(userData);
    });

    it('should delete user successfully', async () => {
      const deleted = await userRepository.delete(createdUser.id);

      expect(deleted).toBe(true);

      // Verificar se o usuário foi realmente deletado
      const foundUser = await userRepository.findById(createdUser.id);
      expect(foundUser).toBeNull();
    });

    it('should return false when user does not exist', async () => {
      const deleted = await userRepository.delete(999);

      expect(deleted).toBe(false);
    });
  });

  describe('updateLastAccess', () => {
    let createdUser: User;

    beforeEach(async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };
      createdUser = await userRepository.create(userData);
    });

    it('should update last access successfully', async () => {
      const originalLastAccess = createdUser.last_access;

      // Aguardar um pouco para garantir diferença de tempo
      await new Promise(resolve => setTimeout(resolve, 10));

      await userRepository.updateLastAccess(createdUser.id);

      // Buscar usuário atualizado
      const updatedUser = await userRepository.findById(createdUser.id);

      expect(updatedUser?.last_access.getTime()).toBeGreaterThan(originalLastAccess?.getTime() || 0);
      expect(updatedUser?.updated_at.getTime()).toBeGreaterThan(createdUser.updated_at.getTime());
    });

    it('should not throw error for non-existent user', async () => {
      // O método não deveria lançar erro, apenas não fazer nada
      await expect(userRepository.updateLastAccess(999)).resolves.not.toThrow();
    });
  });

  describe('updateLastLogin', () => {
    let createdUser: User;

    beforeEach(async () => {
      const userData: CreateUserData = {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'hashedPassword123',
        is_superuser: false
      };
      createdUser = await userRepository.create(userData);
    });

    it('should update last login successfully', async () => {
      const originalLastLogin = createdUser.last_login;

      await userRepository.updateLastLogin(createdUser.id);

      // Buscar usuário atualizado
      const updatedUser = await userRepository.findById(createdUser.id);

      expect(updatedUser?.last_login).toBeInstanceOf(Date);
      expect(updatedUser?.last_login?.getTime()).toBeGreaterThan(originalLastLogin?.getTime() || 0);
      expect(updatedUser?.updated_at.getTime()).toBeGreaterThan(createdUser.updated_at.getTime());
    });

    it('should not throw error for non-existent user', async () => {
      // O método não deveria lançar erro, apenas não fazer nada
      await expect(userRepository.updateLastLogin(999)).resolves.not.toThrow();
    });
  });
});