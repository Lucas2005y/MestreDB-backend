import { UserUseCases } from '../../../application/usecases/UserUseCases';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import { User } from '../../../domain/entities/User';
import { PasswordService } from '../../../application/services/PasswordService';
import { NotFoundError } from '../../../shared/errors/NotFoundError';
import { BadRequestError } from '../../../shared/errors/BadRequestError';
import { ForbiddenError } from '../../../shared/errors/ForbiddenError';
import { ConflictError } from '../../../shared/errors/ConflictError';

describe('UserUseCases - Soft Delete', () => {
  let userUseCases: UserUseCases;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;

  const mockUser = User.createUnsafe(
    1,
    'João Silva',
    'joao@email.com',
    'hashedPassword',
    false,
    new Date(),
    undefined,
    new Date(),
    new Date(),
    undefined
  );

  const mockDeletedUser = User.createUnsafe(
    2,
    'Usuário Deletado',
    'deletado@email.com',
    'hashedPassword',
    false,
    new Date(),
    undefined,
    new Date(),
    new Date(),
    new Date('2024-11-20T10:30:00.000Z')
  );

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findDeleted: jest.fn(),
      restore: jest.fn(),
      hardDelete: jest.fn(),
      updateLastAccess: jest.fn(),
      updateLastLogin: jest.fn(),
      findOne: jest.fn(),
    } as any;

    mockPasswordService = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
      validatePasswordStrength: jest.fn(),
    } as any;

    userUseCases = new UserUseCases(
      mockUserRepository,
      mockPasswordService
    );
  });

  describe('deleteUser (Soft Delete)', () => {
    it('deve fazer soft delete ao invés de hard delete', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await userUseCases.deleteUser(1);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
      expect(mockUserRepository.hardDelete).not.toHaveBeenCalled();
    });

    it('deve permitir usuário deletar própria conta (soft delete)', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        userUseCases.deleteUser(1)
      ).resolves.not.toThrow();

      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve permitir admin deletar qualquer conta (soft delete)', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(
        userUseCases.deleteUser(2)
      ).resolves.not.toThrow();

      expect(mockUserRepository.delete).toHaveBeenCalledWith(2);
    });
  });

  describe('getDeletedUsers', () => {
    it('deve listar apenas usuários deletados', async () => {
      const deletedUsers = [mockDeletedUser];
      mockUserRepository.findDeleted.mockResolvedValue({
        users: deletedUsers,
        total: 1,
      });

      const result = await userUseCases.getDeletedUsers(1, 10);

      expect(mockUserRepository.findDeleted).toHaveBeenCalledWith(1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(2);
      expect(result.pagination.total).toBe(1);
    });

    it('deve retornar lista vazia se não houver deletados', async () => {
      mockUserRepository.findDeleted.mockResolvedValue({
        users: [],
        total: 0,
      });

      const result = await userUseCases.getDeletedUsers(1, 10);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('deve paginar corretamente usuários deletados', async () => {
      const deletedUsers = [mockDeletedUser];
      mockUserRepository.findDeleted.mockResolvedValue({
        users: deletedUsers,
        total: 25,
      });

      const result = await userUseCases.getDeletedUsers(2, 10);

      expect(mockUserRepository.findDeleted).toHaveBeenCalledWith(2, 10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('restoreUser', () => {
    it('deve restaurar usuário deletado com sucesso', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const restoredUser = User.createUnsafe(
        2,
        'Usuário Deletado',
        'deletado@email.com',
        'hashedPassword',
        false,
        new Date(),
        undefined,
        new Date(),
        new Date(),
        undefined
      );
      mockUserRepository.findById.mockResolvedValue(restoredUser);

      const result = await userUseCases.restoreUser(2);

      expect(mockUserRepository.restore).toHaveBeenCalledWith(2);
      expect(result.id).toBe(2);
      expect(result.email).toBe('deletado@email.com');
    });

    it('deve rejeitar restauração de usuário não encontrado', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        userUseCases.restoreUser(999)
      ).rejects.toThrow(NotFoundError);

      await expect(
        userUseCases.restoreUser(999)
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve rejeitar restauração de usuário não deletado', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        userUseCases.restoreUser(1)
      ).rejects.toThrow(BadRequestError);

      await expect(
        userUseCases.restoreUser(1)
      ).rejects.toThrow('Usuário não está deletado');
    });

    it('deve rejeitar restauração se email foi reutilizado', async () => {
      const anotherUser = { ...mockUser, id: 3 };
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);
      mockUserRepository.findByEmail.mockResolvedValue(anotherUser);

      await expect(
        userUseCases.restoreUser(2)
      ).rejects.toThrow(ConflictError);

      await expect(
        userUseCases.restoreUser(2)
      ).rejects.toThrow('Email já está em uso por outro usuário');
    });

    it('deve permitir restauração se email pertence ao mesmo usuário', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);
      mockUserRepository.findByEmail.mockResolvedValue(mockDeletedUser);
      mockUserRepository.findById.mockResolvedValue({
        ...mockDeletedUser,
        deleted_at: undefined,
      });

      await expect(
        userUseCases.restoreUser(2)
      ).resolves.not.toThrow();

      expect(mockUserRepository.restore).toHaveBeenCalledWith(2);
    });
  });

  describe('permanentlyDeleteUser (Hard Delete)', () => {
    it('deve deletar permanentemente usuário com sucesso', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);

      await userUseCases.permanentlyDeleteUser(2, 1);

      expect(mockUserRepository.hardDelete).toHaveBeenCalledWith(2);
    });

    it('deve rejeitar hard delete da própria conta', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        userUseCases.permanentlyDeleteUser(1, 1)
      ).rejects.toThrow(ForbiddenError);

      await expect(
        userUseCases.permanentlyDeleteUser(1, 1)
      ).rejects.toThrow('Não é possível deletar permanentemente sua própria conta');
    });

    it('deve rejeitar hard delete de usuário não encontrado', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        userUseCases.permanentlyDeleteUser(999, 1)
      ).rejects.toThrow(NotFoundError);

      await expect(
        userUseCases.permanentlyDeleteUser(999, 1)
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve permitir hard delete de usuário ativo (não apenas deletados)', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        userUseCases.permanentlyDeleteUser(2, 1)
      ).resolves.not.toThrow();

      expect(mockUserRepository.hardDelete).toHaveBeenCalledWith(2);
    });

    it('deve permitir hard delete de usuário soft deleted', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);

      await expect(
        userUseCases.permanentlyDeleteUser(2, 1)
      ).resolves.not.toThrow();

      expect(mockUserRepository.hardDelete).toHaveBeenCalledWith(2);
    });
  });

  describe('Integração - Fluxo Completo', () => {
    it('deve executar fluxo: criar → soft delete → restaurar → hard delete', async () => {
      // 1. Usuário existe
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // 2. Soft delete
      await userUseCases.deleteUser(2);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(2);

      // 3. Restaurar
      mockUserRepository.findOne.mockResolvedValue(mockDeletedUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      const restoredUser = User.createUnsafe(
        2,
        'Usuário Deletado',
        'deletado@email.com',
        'hashedPassword',
        false,
        new Date(),
        undefined,
        new Date(),
        new Date(),
        undefined
      );
      mockUserRepository.findById.mockResolvedValue(restoredUser);

      await userUseCases.restoreUser(2);
      expect(mockUserRepository.restore).toHaveBeenCalledWith(2);

      // 4. Hard delete
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await userUseCases.permanentlyDeleteUser(2, 1);
      expect(mockUserRepository.hardDelete).toHaveBeenCalledWith(2);
    });
  });
});
