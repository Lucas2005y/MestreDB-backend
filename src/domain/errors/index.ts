/**
 * Exportações centralizadas dos erros de domínio
 */

export { DomainError } from './DomainError';
export { ValidationError } from './ValidationError';
export { UserError } from './UserError';

// Re-exporta o Either para facilitar o uso
export { Either, Left, Right, left, right, tryCatch, tryCatchAsync } from '../../shared/utils/Either';