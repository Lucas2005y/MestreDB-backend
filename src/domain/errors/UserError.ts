import { DomainError } from './DomainError';

/**
 * Erros específicos da entidade User
 */
export class UserError extends DomainError {
  constructor(message: string, code: string) {
    super(message, code);
  }

  static notFound(id?: string): UserError {
    const message = id ? `Usuário não encontrado: ${id}` : 'Usuário não encontrado';
    return new UserError(message, 'USER_NOT_FOUND');
  }

  static emailAlreadyExists(email: string): UserError {
    return new UserError(`Email já está em uso: ${email}`, 'EMAIL_ALREADY_EXISTS');
  }

  static invalidCredentials(): UserError {
    return new UserError('Credenciais inválidas', 'INVALID_CREDENTIALS');
  }

  static unauthorized(): UserError {
    return new UserError('Usuário não autorizado', 'UNAUTHORIZED');
  }

  static forbidden(): UserError {
    return new UserError('Acesso negado', 'FORBIDDEN');
  }

  static cannotDeleteSelf(): UserError {
    return new UserError('Não é possível deletar o próprio usuário', 'CANNOT_DELETE_SELF');
  }

  static cannotUpdateSuperuser(): UserError {
    return new UserError('Não é possível alterar status de superusuário', 'CANNOT_UPDATE_SUPERUSER');
  }
}