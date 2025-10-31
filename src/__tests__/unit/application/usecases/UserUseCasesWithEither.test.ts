import { UserUseCasesWithEither } from '../../../../application/usecases/UserUseCasesWithEither';
import { MockUserRepository } from '../../../mocks/UserRepository.mock';
import { MockPasswordService } from '../../../mocks/PasswordService.mock';
import { User } from '../../../../domain/entities/User';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '../../../../application/dtos/UserDTO';

describe('UserUseCasesWithEither', () => {
  let userUseCases: UserUseCasesWithEither;
  let mockUserRepository: MockUserRepository;
  let mockPasswordService: MockPasswordService;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockPasswordService = new MockPasswordService();
    userUseCases = new UserUseCasesWithEither(mockUserRepository, mockPasswordService);
  });

  afterEach(() => {
    mockUserRepository.reset();
    mockPasswordService.reset();
  });

  describe('createUser', () => {
    const validCreateUserData: CreateUserDTO = {
      name: 'João Silva',
      email: 'joao@example.com',
      password: 'senha123',
      is_superuser: false
    };

    it('should create a user successfully', async () => {
      const result = await userUseCases.createUser(validCreateUserData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const userResponse: UserResponseDTO = result.value;
        expect(userResponse.id).toBeDefined();
        expect(userResponse.name).toBe(validCreateUserData.name);
        expect(userResponse.email).toBe(validCreateUserData.email.toLowerCase());
        expect(userResponse.is_superuser).toBe(validCreateUserData.is_superuser);
        expect(userResponse.created_at).toBeInstanceOf(Date);
        expect(userResponse.updated_at).toBeInstanceOf(Date);
      }

      // Verificar se o usuário foi salvo no repositório
      const users = mockUserRepository.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(validCreateUserData.email.toLowerCase());
    });

    it('should fail when user already exists', async () => {
      // Criar usuário primeiro
      await userUseCases.createUser(validCreateUserData);

      // Tentar criar novamente com o mesmo email
      const result = await userUseCases.createUser(validCreateUserData);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('já está em uso');
      }
    });

    it('should fail with invalid user data', async () => {
      const invalidData: CreateUserDTO = {
        name: '', // Nome inválido
        email: 'joao@example.com',
        password: 'senha123',
        is_superuser: false
      };

      const result = await userUseCases.createUser(invalidData);

      expect(result.isLeft()).toBe(true);
    });

    it('should fail when password hashing fails', async () => {
      mockPasswordService.setShouldFailHash(true);

      const result = await userUseCases.createUser(validCreateUserData);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('hash');
      }
    });

    it('should create user with hashed password', async () => {
      await userUseCases.createUser(validCreateUserData);

      const users = mockUserRepository.getUsers();
      expect(users[0].password).toBe(`hashed_${validCreateUserData.password}`);
    });
  });

  describe('getUserById', () => {
    let existingUser: User;

    beforeEach(async () => {
      const createResult = await userUseCases.createUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        is_superuser: false
      });

      if (createResult.isRight()) {
        const users = mockUserRepository.getUsers();
        existingUser = users[0];
      }
    });

    it('should get user by id successfully', async () => {
      const result = await userUseCases.getUserById(existingUser.id);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const userResponse = result.value;
        expect(userResponse).not.toBeNull();
        if (userResponse) {
          expect(userResponse.id).toBe(existingUser.id);
          expect(userResponse.name).toBe(existingUser.name);
          expect(userResponse.email).toBe(existingUser.email);
        }
      }
    });

    it('should return null when user does not exist', async () => {
      const result = await userUseCases.getUserById(999);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        expect(result.value).toBeNull();
      }
    });

    it('should update last access when getting user', async () => {
      const originalLastAccess = existingUser.last_access;

      // Aguardar um pouco para garantir diferença de tempo
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await userUseCases.getUserById(existingUser.id);

      expect(result.isRight()).toBe(true);

      // Verificar se o last_access foi atualizado no repositório
      const users = mockUserRepository.getUsers();
      const updatedUser = users.find(u => u.id === existingUser.id);
      expect(updatedUser?.last_access.getTime()).toBeGreaterThan(originalLastAccess.getTime());
    });
  });

  describe('updateUser', () => {
    let existingUser: User;

    beforeEach(async () => {
      const createResult = await userUseCases.createUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        is_superuser: false
      });

      if (createResult.isRight()) {
        const users = mockUserRepository.getUsers();
        existingUser = users[0];
      }
    });

    it('should update user name successfully', async () => {
      const updateData: UpdateUserDTO = {
        name: 'João Santos'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const userResponse: UserResponseDTO = result.value;
        expect(userResponse.name).toBe(updateData.name);
        expect(userResponse.email).toBe(existingUser.email);
      }
    });

    it('should update user email successfully', async () => {
      const updateData: UpdateUserDTO = {
        email: 'joao.santos@example.com'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const userResponse: UserResponseDTO = result.value;
        expect(userResponse.email).toBe(updateData.email?.toLowerCase());
        expect(userResponse.name).toBe(existingUser.name);
      }
    });

    it('should update user password successfully', async () => {
      const updateData: UpdateUserDTO = {
        password: 'novaSenha123'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isRight()).toBe(true);

      // Verificar se a senha foi hasheada
      const users = mockUserRepository.getUsers();
      const updatedUser = users.find(u => u.id === existingUser.id);
      expect(updatedUser?.password).toBe(`hashed_${updateData.password}`);
    });

    it('should update multiple fields successfully', async () => {
      const updateData: UpdateUserDTO = {
        name: 'João Santos',
        email: 'joao.santos@example.com',
        password: 'novaSenha123'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isRight()).toBe(true);
      if (result.isRight()) {
        const userResponse: UserResponseDTO = result.value;
        expect(userResponse.name).toBe(updateData.name);
        expect(userResponse.email).toBe(updateData.email?.toLowerCase());
      }
    });

    it('should fail when user does not exist', async () => {
      const updateData: UpdateUserDTO = {
        name: 'João Santos'
      };

      const result = await userUseCases.updateUser(999, updateData);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('não encontrado');
      }
    });

    it('should fail with invalid update data', async () => {
      const updateData: UpdateUserDTO = {
        name: '' // Nome inválido
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isLeft()).toBe(true);
    });

    it('should fail when email is already in use', async () => {
      // Criar outro usuário
      await userUseCases.createUser({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'senha123',
        is_superuser: false
      });

      // Tentar atualizar o primeiro usuário com o email do segundo
      const updateData: UpdateUserDTO = {
        email: 'maria@example.com'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.message).toContain('já está em uso');
      }
    });

    it('should fail when password hashing fails', async () => {
      mockPasswordService.setShouldFailHash(true);

      const updateData: UpdateUserDTO = {
        password: 'novaSenha123'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isLeft()).toBe(true);
    });

    it('should update updated_at field', async () => {
      const originalUpdatedAt = existingUser.updated_at;

      // Aguardar um pouco para garantir diferença de tempo
      await new Promise(resolve => setTimeout(resolve, 10));

      const updateData: UpdateUserDTO = {
        name: 'João Santos'
      };

      const result = await userUseCases.updateUser(existingUser.id, updateData);

      expect(result.isRight()).toBe(true);

      // Verificar se o updated_at foi atualizado
      const users = mockUserRepository.getUsers();
      const updatedUser = users.find(u => u.id === existingUser.id);
      expect(updatedUser?.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Simular erro no repositório fazendo com que o mock falhe
      const originalCreate = mockUserRepository.create;
      mockUserRepository.create = jest.fn().mockRejectedValue(new Error('Database error'));

      const result = await userUseCases.createUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        is_superuser: false
      });

      expect(result.isLeft()).toBe(true);

      // Restaurar método original
      mockUserRepository.create = originalCreate;
    });

    it('should handle empty update data', async () => {
      // Criar usuário primeiro
      const createResult = await userUseCases.createUser({
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'senha123',
        is_superuser: false
      });

      if (createResult.isRight()) {
        const users = mockUserRepository.getUsers();
        const existingUser = users[0];

        // Tentar atualizar com dados vazios
        const result = await userUseCases.updateUser(existingUser.id, {});

        expect(result.isRight()).toBe(true);
        if (result.isRight()) {
          // Os dados devem permanecer os mesmos
          expect(result.value.name).toBe(existingUser.name);
          expect(result.value.email).toBe(existingUser.email);
        }
      }
    });
  });
});