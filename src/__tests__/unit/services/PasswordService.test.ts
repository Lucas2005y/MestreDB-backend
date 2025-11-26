import { PasswordService } from '../../../application/services/PasswordService';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hashPassword', () => {
    it('deve gerar hash da senha', async () => {
      const password = 'MinhaSenh@123';
      const hash = await passwordService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$2[aby]\$/); // Formato bcrypt
    });

    it('deve gerar hashes diferentes para a mesma senha', async () => {
      const password = 'MinhaSenh@123';
      const hash1 = await passwordService.hashPassword(password);
      const hash2 = await passwordService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt diferente
    });

    it('deve rejeitar senha vazia', async () => {
      await expect(passwordService.hashPassword('')).rejects.toThrow();
    });
  });

  describe('verifyPassword', () => {
    it('deve retornar true para senha correta', async () => {
      const password = 'MinhaSenh@123';
      const hash = await passwordService.hashPassword(password);

      const isValid = await passwordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('deve retornar false para senha incorreta', async () => {
      const password = 'MinhaSenh@123';
      const wrongPassword = 'SenhaErrada123';
      const hash = await passwordService.hashPassword(password);

      const isValid = await passwordService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('deve retornar false para hash inválido', async () => {
      const password = 'MinhaSenh@123';
      const invalidHash = 'hash_invalido';

      const isValid = await passwordService.verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });

    it('deve ser case-sensitive', async () => {
      const password = 'MinhaSenh@123';
      const hash = await passwordService.hashPassword(password);

      const isValid = await passwordService.verifyPassword('minhasENH@123', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('deve aceitar senha forte', () => {
      const strongPasswords = [
        'MinhaSenh@123',
        'P@ssw0rd!Strong',
        'Abc123!@#Xyz',
      ];

      strongPasswords.forEach((password) => {
        const result = passwordService.validatePasswordStrength(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('deve rejeitar senha muito curta', () => {
      const result = passwordService.validatePasswordStrength('Abc@1');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('8 caracteres'))).toBe(true);
    });

    it('deve rejeitar senha sem letra maiúscula', () => {
      const result = passwordService.validatePasswordStrength('minhasenha@123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('maiúscula'))).toBe(true);
    });

    it('deve rejeitar senha sem letra minúscula', () => {
      const result = passwordService.validatePasswordStrength('MINHASENHA@123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('minúscula'))).toBe(true);
    });

    it('deve rejeitar senha sem número', () => {
      const result = passwordService.validatePasswordStrength('MinhaSenha@Forte');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('número'))).toBe(true);
    });

    it('deve rejeitar senha sem caractere especial', () => {
      const result = passwordService.validatePasswordStrength('MinhaSenha123');
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('especial'))).toBe(true);
    });
  });
});
