import { ValidationService } from '../../../application/services/ValidationService';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateEmail', () => {
    it('deve aceitar emails válidos', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(() => validationService.validateEmail(email)).not.toThrow();
      });
    });

    it('deve rejeitar emails inválidos', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      invalidEmails.forEach((email) => {
        expect(() => validationService.validateEmail(email)).toThrow();
      });
    });

    it('deve rejeitar email vazio', () => {
      expect(() => validationService.validateEmail('')).toThrow();
    });

    it('deve rejeitar email muito longo', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => validationService.validateEmail(longEmail)).toThrow();
    });
  });

  describe('validateName', () => {
    it('deve aceitar nomes válidos', () => {
      const validNames = [
        'João Silva',
        'Maria da Silva',
        'José',
        'Ana Paula Costa',
      ];

      validNames.forEach((name) => {
        expect(() => validationService.validateName(name)).not.toThrow();
      });
    });

    it('deve rejeitar nome vazio', () => {
      expect(() => validationService.validateName('')).toThrow();
    });

    it('deve rejeitar nome muito curto', () => {
      expect(() => validationService.validateName('A')).toThrow();
    });

    it('deve rejeitar nome muito longo', () => {
      const longName = 'A'.repeat(100);
      expect(() => validationService.validateName(longName)).toThrow();
    });
  });

  describe('validateId', () => {
    it('deve aceitar IDs válidos', () => {
      const validIds = [1, 10, 100, 999999];

      validIds.forEach((id) => {
        expect(() => validationService.validateId(id)).not.toThrow();
      });
    });

    it('deve rejeitar ID zero', () => {
      expect(() => validationService.validateId(0)).toThrow();
    });

    it('deve rejeitar ID negativo', () => {
      expect(() => validationService.validateId(-1)).toThrow();
    });

    it('deve rejeitar ID não numérico', () => {
      expect(() => validationService.validateId(NaN)).toThrow();
      expect(() => validationService.validateId(Infinity)).toThrow();
    });
  });

  describe('sanitizeInput', () => {
    it('deve remover espaços extras', () => {
      const result = validationService.sanitizeInput('  texto  com  espaços  ');
      expect(result).toBe('texto com espaços');
    });

    it('deve remover caracteres perigosos', () => {
      const result = validationService.sanitizeInput('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('deve retornar string vazia para input vazio', () => {
      expect(validationService.sanitizeInput('')).toBe('');
      expect(validationService.sanitizeInput('   ')).toBe('');
    });
  });
});
