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
        expect(() => passwordService.validatePasswordStrength(password)).not.toThrow();
      });
    });

    it('deve rejeitar senha muito curta', () => {
      expect(() => passwordService.validatePasswordStrength('Abc@1')).toThrow('muito curta');
    });

    it('deve rejeitar senha sem letra maiúscula', () => {
      expect(() => passwordService.validatePasswordStrength('minhasenha@123')).toThrow(
        'maiúscula'
      );
    });

    it('deve rejeitar senha sem letra minúscula', () => {
      expect(() => passwordService.validatePasswordStrength('MINHASENHA@123')).toThrow(
        'minúscula'
      );
    });

    it('deve rejeitar senha sem número', () => {
      expect(() => passwordService.validatePasswordStrength('MinhaSenha@Forte')).toThrow(
        'número'
      );
    });

    it('deve rejeitar senha sem caractere especial', () => {
      expect(() => passwordService.validatePasswordStrength('MinhaSenha123')).toThrow(
        'especial'
      );
    });
  });
});
