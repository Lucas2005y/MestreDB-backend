import * as bcrypt from 'bcrypt';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PasswordService {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Gera hash da senha usando bcrypt
   * @param password - Senha em texto plano
   * @returns Promise com hash da senha
   */
  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('Senha é obrigatória');
    }

    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verifica se a senha corresponde ao hash
   * @param password - Senha em texto plano
   * @param hash - Hash armazenado no banco
   * @returns Promise com resultado da verificação
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    return await bcrypt.compare(password, hash);
  }

  /**
   * Valida a força da senha
   * @param password - Senha a ser validada
   * @returns Resultado da validação com erros se houver
   */
  validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Senha é obrigatória');
      return { isValid: false, errors };
    }

    // Mínimo 8 caracteres
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    // Pelo menos um número
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera uma senha temporária segura
   * @param length - Comprimento da senha (padrão: 12)
   * @returns Senha temporária
   */
  generateTemporaryPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Garantir pelo menos um de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Preencher o resto aleatoriamente
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Verifica se a senha atende aos critérios mínimos (versão simplificada)
   * @param password - Senha a ser validada
   * @returns true se a senha é válida
   */
  isPasswordValid(password: string): boolean {
    const result = this.validatePasswordStrength(password);
    return result.isValid;
  }
}