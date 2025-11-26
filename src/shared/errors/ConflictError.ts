export class ConflictError extends Error {
  constructor(message: string = 'Conflito de dados') {
    super(message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
