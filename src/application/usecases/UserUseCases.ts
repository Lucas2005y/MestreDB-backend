import { User } from '../../domain/entities/User';
import { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/interfaces/IUserRepository';
import { CreateUserDTO, UpdateUserDTO, UpdateOwnProfileDTO, UserResponseDTO, PaginatedUsersResponseDTO } from '../dtos/UserDTO';
import { PaginationParams, PaginationHelper, PaginatedResponse } from '../dtos/PaginationDTO';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PasswordService } from '../services/PasswordService';

export class UserUseCases {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService
  ) {}

  async createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
    // Validação dos dados
    const userDto = plainToClass(CreateUserDTO, userData);
    const errors = await validate(userDto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(`Dados inválidos: ${errorMessages}`);
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await this.passwordService.hashPassword(userData.password);

    // Criar usuário
    const createData: CreateUserData = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      is_superuser: userData.is_superuser || false
    };

    const user = await this.userRepository.create(createData);
    return this.mapToResponseDTO(user);
  }

  async getUserById(id: number): Promise<UserResponseDTO | null> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    // Verificar se a conta foi deletada
    if (user.deleted_at) {
      return null;
    }

    // Atualizar último acesso
    await this.userRepository.updateLastAccess(id);

    return this.mapToResponseDTO(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDTO | null> {
    if (!email) {
      throw new Error('Email é obrigatório');
    }

    const user = await this.userRepository.findByEmail(email);
    return user ? this.mapToResponseDTO(user) : null;
  }

  /**
   * Lista usuários com paginação padronizada
   */
  async getAllUsers(params: PaginationParams): Promise<PaginatedResponse<UserResponseDTO>> {
    // Valida e normaliza parâmetros
    const validatedParams = PaginationHelper.validateParams(params);

    // Busca usuários
    const { users, total } = await this.userRepository.findAll(
      validatedParams.page,
      validatedParams.limit
    );

    // Mapeia para DTOs
    const data = users.map(user => this.mapToResponseDTO(user));

    // Cria resposta paginada
    return PaginationHelper.createResponse(data, {
      page: validatedParams.page,
      limit: validatedParams.limit,
      total,
    });
  }

  /**
   * Lista usuários (método legado - mantido para compatibilidade)
   * @deprecated Use getAllUsers com PaginationParams
   */
  async getAllUsersLegacy(page: number = 1, limit: number = 10): Promise<PaginatedUsersResponseDTO> {
    if (page <= 0) page = 1;
    if (limit <= 0 || limit > 100) limit = 10;

    const { users, total } = await this.userRepository.findAll(page, limit);
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(user => this.mapToResponseDTO(user)),
      total,
      page,
      limit,
      totalPages
    };
  }

  async updateUser(id: number, userData: UpdateUserDTO): Promise<UserResponseDTO | null> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    // Validação dos dados
    const userDto = plainToClass(UpdateUserDTO, userData);
    const errors = await validate(userDto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(`Dados inválidos: ${errorMessages}`);
    }

    // Verificar se usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return null;
    }

    // Verificar se a conta foi deletada
    if (existingUser.deleted_at) {
      throw new Error('Não é possível atualizar uma conta desativada');
    }

    // Verificar se email já está em uso por outro usuário
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(userData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email já está em uso');
      }
    }

    // Preparar dados para atualização
    const updateData: UpdateUserData = {
      name: userData.name,
      email: userData.email
    };

    // Hash da nova senha se fornecida
    if (userData.password) {
      // Validar força da senha
      const passwordValidation = this.passwordService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Dados inválidos: ${passwordValidation.errors.join(', ')}`);
      }

      updateData.password = await this.passwordService.hashPassword(userData.password);
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    return updatedUser ? this.mapToResponseDTO(updatedUser) : null;
  }

  async updateOwnProfile(id: number, userData: UpdateOwnProfileDTO): Promise<UserResponseDTO | null> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    // Validação dos dados
    const userDto = plainToClass(UpdateOwnProfileDTO, userData);
    const errors = await validate(userDto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new Error(`Dados inválidos: ${errorMessages}`);
    }

    // Verificar se usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return null;
    }

    // Verificar se a conta foi deletada
    if (existingUser.deleted_at) {
      throw new Error('Não é possível atualizar uma conta desativada');
    }

    // Verificar se email já está em uso por outro usuário
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(userData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error('Email já está em uso');
      }
    }

    // Preparar dados para atualização (sem is_superuser)
    const updateData: UpdateUserData = {
      name: userData.name,
      email: userData.email
    };

    // Hash da nova senha se fornecida
    if (userData.password) {
      // Validar força da senha
      const passwordValidation = this.passwordService.validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Dados inválidos: ${passwordValidation.errors.join(', ')}`);
      }
      updateData.password = await this.passwordService.hashPassword(userData.password);
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    return updatedUser ? this.mapToResponseDTO(updatedUser) : null;
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID inválido');
    }

    // Verificar se usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      return false;
    }

    // Verificar se a conta já foi deletada
    if (existingUser.deleted_at) {
      throw new Error('Esta conta já foi desativada');
    }

    return await this.userRepository.delete(id);
  }

  async authenticateUser(email: string, password: string): Promise<UserResponseDTO | null> {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Atualizar último login
    await this.userRepository.updateLastLogin(user.id);

    return this.mapToResponseDTO(user);
  }

  private mapToResponseDTO(user: User): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      is_superuser: user.is_superuser,
      last_access: user.last_access,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  // ========================================
  // SOFT DELETE METHODS
  // ========================================

  async getDeletedUsers(page: number, limit: number): Promise<PaginatedResponse<UserResponseDTO>> {
    const { users, total } = await this.userRepository.findDeleted(page, limit);

    const data = users.map(user => this.mapToResponseDTO(user));

    return PaginationHelper.createResponse(data, {
      page,
      limit,
      total,
    });
  }

  async restoreUser(id: number): Promise<UserResponseDTO> {
    const { NotFoundError } = await import('../../shared/errors/NotFoundError');
    const { BadRequestError } = await import('../../shared/errors/BadRequestError');
    const { ConflictError } = await import('../../shared/errors/ConflictError');

    // Buscar usuário deletado
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (!user.deleted_at) {
      throw new BadRequestError('Usuário não está deletado');
    }

    // Verificar se email não foi reutilizado
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser && existingUser.id !== id) {
      throw new ConflictError('Email já está em uso por outro usuário');
    }

    await this.userRepository.restore(id);

    const restoredUser = await this.userRepository.findById(id);
    return this.mapToResponseDTO(restoredUser!);
  }

  async permanentlyDeleteUser(id: number, requestingUserId: number): Promise<void> {
    const { NotFoundError } = await import('../../shared/errors/NotFoundError');
    const { ForbiddenError } = await import('../../shared/errors/ForbiddenError');
    const { logger } = await import('../../shared/utils/logger');

    // Não pode deletar própria conta permanentemente
    if (id === requestingUserId) {
      throw new ForbiddenError('Não é possível deletar permanentemente sua própria conta');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Log de auditoria
    logger.warn('Hard delete executado', {
      userId: id,
      deletedBy: requestingUserId,
      email: user.email,
    });

    await this.userRepository.hardDelete(id);
  }
}
