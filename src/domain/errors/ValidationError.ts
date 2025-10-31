import { DomainError } from './DomainError';

/**
 * Erro de validação de domínio
 */
export class ValidationError extends DomainError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.field = field;
  }

  static invalidEmail(email: string): ValidationError {
    return new ValidationError(`Email inválido: ${email}`, 'email');
  }

  static invalidName(name: string): ValidationError {
    return new ValidationError(`Nome inválido: ${name}`, 'name');
  }

  static fieldRequired(fieldName: string): ValidationError {
    return new ValidationError(`Campo obrigatório: ${fieldName}`, fieldName);
  }

  static fieldTooShort(fieldName: string, minLength: number): ValidationError {
    return new ValidationError(
      `Campo ${fieldName} deve ter pelo menos ${minLength} caracteres`,
      fieldName
    );
  }

  static fieldTooLong(fieldName: string, maxLength: number): ValidationError {
    return new ValidationError(
      `Campo ${fieldName} deve ter no máximo ${maxLength} caracteres`,
      fieldName
    );
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      field: this.field
    };
  }
}