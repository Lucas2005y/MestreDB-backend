import { PasswordService, PasswordValidationResult } from '../../application/services/PasswordService';

export class MockPasswordService extends PasswordService {
  private shouldFailHash = false;
  private shouldFailVerify = false;
  private verifyResult = true;

  constructor() {
    super(12); // Chama o construtor da classe pai com saltRounds
  }

  // Métodos para controlar o mock
  public setShouldFailHash(shouldFail: boolean): void {
    this.shouldFailHash = shouldFail;
  }

  public setShouldFailVerify(shouldFail: boolean): void {
    this.shouldFailVerify = shouldFail;
  }

  public setVerifyResult(result: boolean): void {
    this.verifyResult = result;
  }

  public reset(): void {
    this.shouldFailHash = false;
    this.shouldFailVerify = false;
    this.verifyResult = true;
  }

  // Override dos métodos para testes
  async hashPassword(password: string): Promise<string> {
    if (this.shouldFailHash) {
      throw new Error('Erro ao fazer hash da senha');
    }

    // Simular hash da senha (apenas adicionar prefixo para testes)
    return `hashed_${password}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (this.shouldFailVerify) {
      throw new Error('Erro ao verificar senha');
    }

    // Simular verificação (verificar se o hash corresponde ao padrão esperado)
    const expectedHash = `hashed_${password}`;
    return hash === expectedHash ? this.verifyResult : false;
  }

  // Manter os outros métodos da classe pai
  validatePasswordStrength(password: string): PasswordValidationResult {
    return super.validatePasswordStrength(password);
  }

  generateTemporaryPassword(length: number = 12): string {
    return super.generateTemporaryPassword(length);
  }

  isPasswordValid(password: string): boolean {
    return super.isPasswordValid(password);
  }
}