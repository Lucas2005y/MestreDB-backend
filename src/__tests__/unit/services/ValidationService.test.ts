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
        const result = validationService.validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
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
        const result = validationService.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('deve rejeitar email vazio', () => {
      const result = validationService.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve rejeitar email muito longo', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validationService.validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateRequired', () => {
    it('deve aceitar valores válidos', () => {
      const result = validationService.validateRequired('João Silva', 'name');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar valor vazio', () => {
      const result = validationService.validateRequired('', 'name');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve rejeitar valor null', () => {
      const result = validationService.validateRequired(null, 'name');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve rejeitar valor undefined', () => {
      const result = validationService.validateRequired(undefined, 'name');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateStringLength', () => {
    it('deve aceitar string dentro do limite', () => {
      const result = validationService.validateStringLength('João Silva', 'name', 2, 80);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar string muito curta', () => {
      const result = validationService.validateStringLength('A', 'name', 2, 80);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve rejeitar string muito longa', () => {
      const longString = 'A'.repeat(81);
      const result = validationService.validateStringLength(longString, 'name', 2, 80);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve aceitar string sem limite mínimo', () => {
      const result = validationService.validateStringLength('Test', 'name', undefined, 80);
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar string sem limite máximo', () => {
      const result = validationService.validateStringLength('Test', 'name', 2, undefined);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateId', () => {
    it('deve aceitar IDs válidos', () => {
      const validIds = [1, 10, 100, 999999];

      validIds.forEach((id) => {
        const result = validationService.validateId(id);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('deve rejeitar ID zero', () => {
      const result = validationService.validateId(0);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve rejeitar ID negativo', () => {
      const result = validationService.validateId(-1);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('deve rejeitar ID não numérico', () => {
      const nanResult = validationService.validateId(NaN);
      expect(nanResult.isValid).toBe(false);

      const infResult = validationService.validateId(Infinity);
      expect(infResult.isValid).toBe(false);
    });
  });
});
