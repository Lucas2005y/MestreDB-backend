import { User } from '../../domain/entities/User';
import { IUserRepository, CreateUserData } from '../../domain/interfaces/IUserRepository';
import { CreateUserDTO, UserResponseDTO } from '../dtos/UserDTO';
import { PasswordService } from '../services/PasswordService';
import { 
  DomainError,
  ValidationError, 
  UserError, 
  Either, 
  left, 
  right, 
  tryCatchAsync 
} from '../../domain/errors';

/**
 * Classe concreta para erros gerais de domínio
 */
class GeneralDomainError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

/**
 * Exemplo de UserUseCases refatorado com Either pattern
 * Demonstra como implementar tratamento funcional de erros
 */
export class UserUseCasesWithEither {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService
  ) {}

  /**
   * Cria um novo usuário usando Either pattern
   */
  async createUser(userData: CreateUserDTO): Promise<Either<DomainError, UserResponseDTO>> {
    // Validar dados de entrada usando as validações da entidade
    const nameValidation = User.validateName(userData.name);
    if (nameValidation.isLeft()) {
      return left(nameValidation.value);
    }

    const emailValidation = User.validateEmail(userData.email);
    if (emailValidation.isLeft()) {
      return left(emailValidation.value);
    }

    const passwordValidation = User.validatePassword(userData.password);
    if (passwordValidation.isLeft()) {
      return left(passwordValidation.value);
    }

    // Verificar se email já existe
    const existingUserResult = await tryCatchAsync(
      () => this.userRepository.findByEmail(userData.email),
      (error) => new GeneralDomainError(`Erro ao verificar email: ${error}`, 'DATABASE_ERROR')
    );

    if (existingUserResult.isLeft()) {
      return left(existingUserResult.value);
    }

    if ((existingUserResult as any).value) {
      return left(UserError.emailAlreadyExists(userData.email));
    }

    // Hash da senha
    const hashedPasswordResult = await tryCatchAsync(
        () => this.passwordService.hashPassword(userData.password),
        (error) => new GeneralDomainError(`Erro ao processar senha: ${error}`, 'PASSWORD_HASH_ERROR')
      );

    if (hashedPasswordResult.isLeft()) {
      return left(hashedPasswordResult.value);
    }

    // Criar dados para o repositório (após validações)
    const createData: CreateUserData = {
      name: userData.name,
      email: userData.email,
      password: (hashedPasswordResult as any).value,
      is_superuser: userData.is_superuser || false
    };

    // Criar usuário no repositório
    const userResult = await tryCatchAsync(
      () => this.userRepository.create(createData),
      (error) => new GeneralDomainError(`Erro ao criar usuário: ${error}`, 'DATABASE_ERROR')
    );

    if (userResult.isLeft()) {
      return left(userResult.value);
    }

    // Mapear para DTO de resposta
    return right(this.mapToResponseDTO((userResult as any).value));
  }

  /**
   * Busca usuário por ID usando Either pattern
   */
  async getUserById(id: number): Promise<Either<DomainError, UserResponseDTO | null>> {
    if (!id || id <= 0) {
      return left(ValidationError.invalidName(`ID inválido: ${id}`));
    }

    const userResult = await tryCatchAsync(
      () => this.userRepository.findById(id),
      (error) => new GeneralDomainError(`Erro ao buscar usuário: ${error}`, 'DATABASE_ERROR')
    );

    if (userResult.isLeft()) {
      return left(userResult.value);
    }

    const user = (userResult as any).value;
    if (!user) {
      return right(null);
    }

    // Atualizar último acesso
    const updateLastAccessResult = await tryCatchAsync(
      () => this.userRepository.updateLastAccess(id),
      (error) => new GeneralDomainError(`Erro ao atualizar último acesso: ${error}`, 'DATABASE_ERROR')
    );

    if (updateLastAccessResult.isLeft()) {
      return left(updateLastAccessResult.value);
    }

    return right(this.mapToResponseDTO(user));
  }

  /**
   * Atualiza usuário usando Either pattern
   */
  async updateUser(
    id: number, 
    userData: Partial<CreateUserDTO>
  ): Promise<Either<DomainError, UserResponseDTO>> {
    // Buscar usuário existente
    const existingUserResult = await this.getUserById(id);
    if (existingUserResult.isLeft()) {
      return left(existingUserResult.value);
    }

    if (!(existingUserResult as any).value) {
      return left(UserError.notFound(id.toString()));
    }

    // Buscar entidade completa
    const userResult = await tryCatchAsync(
      () => this.userRepository.findById(id),
      (error) => new GeneralDomainError(`Erro ao buscar usuário: ${error}`, 'DATABASE_ERROR')
    );

    if (userResult.isLeft()) {
      return left(userResult.value);
    }

    const userEntity = (userResult as any).value!;

    // Preparar dados de atualização
    let updateData: Partial<{ name: string; email: string; password: string }> = {};

    if (userData.name !== undefined) {
      updateData.name = userData.name;
    }

    if (userData.email !== undefined) {
      updateData.email = userData.email;
    }

    if (userData.password !== undefined) {
      const hashedPasswordResult = await tryCatchAsync(
        () => this.passwordService.hashPassword(userData.password!),
        (error) => new GeneralDomainError(`Erro ao processar senha: ${error}`, 'PASSWORD_HASH_ERROR')
      );

      if (hashedPasswordResult.isLeft()) {
        return left(hashedPasswordResult.value);
      }

      // Type narrowing: agora sabemos que é Right
      updateData.password = (hashedPasswordResult as any).value;
    }

    // Usar o método update da entidade com validações
    const updatedUserResult = userEntity.update(updateData);
    if (updatedUserResult.isLeft()) {
      return left(updatedUserResult.value);
    }

    // Salvar no repositório
    const savedUserResult = await tryCatchAsync(
      () => this.userRepository.update(id, {
        name: updatedUserResult.value.name,
        email: updatedUserResult.value.email,
        password: updatedUserResult.value.password
      }),
      (error) => new GeneralDomainError(`Erro ao salvar usuário: ${error}`, 'DATABASE_ERROR')
    );

    if (savedUserResult.isLeft()) {
      return left(savedUserResult.value);
    }

    // Type narrowing: agora sabemos que é Right
    const savedUser = (savedUserResult as any).value;
    if (!savedUser) {
      return left(UserError.notFound(id.toString()));
    }

    return right(this.mapToResponseDTO(savedUser));
  }

  /**
   * Mapeia User para UserResponseDTO
   */
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
}