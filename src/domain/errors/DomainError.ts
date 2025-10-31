/**
 * Classe base para todos os erros de domínio
 * Seguindo os princípios da Clean Architecture
 */
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    
    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Retorna uma representação JSON do erro
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString()
    };
  }

  /**
   * Verifica se o erro é do tipo especificado
   */
  static isInstanceOf(error: unknown, errorClass: typeof DomainError): boolean {
    return error instanceof errorClass;
  }
}