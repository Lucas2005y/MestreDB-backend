import { RateLimitingService } from '../../../application/services/RateLimitingService';

describe('RateLimitingService', () => {
  let rateLimitService: RateLimitingService;

  beforeEach(() => {
    // Configuração de teste com valores menores
    process.env.RATE_LIMIT_MAX_ATTEMPTS = '3';
    process.env.RATE_LIMIT_WINDOW_MINUTES = '1';
    process.env.RATE_LIMIT_BLOCK_MINUTES = '1';

    rateLimitService = new RateLimitingService();
  });

  afterEach(() => {
    rateLimitService.destroy();
    delete process.env.RATE_LIMIT_MAX_ATTEMPTS;
    delete process.env.RATE_LIMIT_WINDOW_MINUTES;
    delete process.env.RATE_LIMIT_BLOCK_MINUTES;
  });

  describe('canAttempt', () => {
    it('deve permitir primeira tentativa', () => {
      const result = rateLimitService.canAttempt('test@example.com');

      expect(result.allowed).toBe(true);
      expect(result.attemptsLeft).toBe(3);
    });

    it('deve permitir tentativas dentro do limite', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);

      const result = rateLimitService.canAttempt('test@example.com');

      expect(result.allowed).toBe(true);
      expect(result.attemptsLeft).toBe(1);
    });

    it('deve bloquear após exceder limite', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);

      const result = rateLimitService.canAttempt('test@example.com');

      expect(result.allowed).toBe(false);
      expect(result.remainingTime).toBeGreaterThan(0);
    });

    it('deve retornar tempo restante quando bloqueado', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);

      const result = rateLimitService.canAttempt('test@example.com');

      expect(result.allowed).toBe(false);
      expect(result.remainingTime).toBeLessThanOrEqual(60);
    });
  });

  describe('recordAttempt', () => {
    it('deve registrar tentativa falhada', () => {
      rateLimitService.recordAttempt('test@example.com', false);

      const stats = rateLimitService.getStats('test@example.com');

      expect(stats).not.toBeNull();
      expect(stats?.attempts).toBe(1);
    });

    it('deve incrementar contador em múltiplas falhas', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);

      const stats = rateLimitService.getStats('test@example.com');

      expect(stats?.attempts).toBe(3);
    });

    it('deve resetar contador em sucesso', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', true);

      const stats = rateLimitService.getStats('test@example.com');

      expect(stats).toBeNull();
    });

    it('deve manter contadores separados por identificador', () => {
      rateLimitService.recordAttempt('user1@example.com', false);
      rateLimitService.recordAttempt('user2@example.com', false);
      rateLimitService.recordAttempt('user2@example.com', false);

      const stats1 = rateLimitService.getStats('user1@example.com');
      const stats2 = rateLimitService.getStats('user2@example.com');

      expect(stats1?.attempts).toBe(1);
      expect(stats2?.attempts).toBe(2);
    });
  });

  describe('getStats', () => {
    it('deve retornar null para identificador sem tentativas', () => {
      const stats = rateLimitService.getStats('unknown@example.com');

      expect(stats).toBeNull();
    });

    it('deve retornar estatísticas corretas', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);

      const stats = rateLimitService.getStats('test@example.com');

      expect(stats).not.toBeNull();
      expect(stats?.attempts).toBe(2);
      expect(stats?.windowExpires).toBeInstanceOf(Date);
    });

    it('deve incluir blockedUntil quando bloqueado', () => {
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.recordAttempt('test@example.com', false);
      rateLimitService.canAttempt('test@example.com'); // Trigger block

      const stats = rateLimitService.getStats('test@example.com');

      expect(stats?.blockedUntil).toBeInstanceOf(Date);
    });
  });

  describe('updateConfig', () => {
    it('deve atualizar configuração', () => {
      rateLimitService.updateConfig({ maxAttempts: 5 });

      const config = rateLimitService.getConfig();

      expect(config.maxAttempts).toBe(5);
    });

    it('deve manter valores não atualizados', () => {
      const originalConfig = rateLimitService.getConfig();
      rateLimitService.updateConfig({ maxAttempts: 10 });

      const config = rateLimitService.getConfig();

      expect(config.maxAttempts).toBe(10);
      expect(config.windowMinutes).toBe(originalConfig.windowMinutes);
    });
  });

  describe('reset', () => {
    it('deve limpar todas as tentativas', () => {
      rateLimitService.recordAttempt('user1@example.com', false);
      rateLimitService.recordAttempt('user2@example.com', false);

      rateLimitService.reset();

      expect(rateLimitService.getStats('user1@example.com')).toBeNull();
      expect(rateLimitService.getStats('user2@example.com')).toBeNull();
    });
  });

  describe('getConfig', () => {
    it('deve retornar configuração atual', () => {
      const config = rateLimitService.getConfig();

      expect(config).toHaveProperty('maxAttempts');
      expect(config).toHaveProperty('windowMinutes');
      expect(config).toHaveProperty('blockMinutes');
    });

    it('deve retornar cópia da configuração', () => {
      const config1 = rateLimitService.getConfig();
      config1.maxAttempts = 999;

      const config2 = rateLimitService.getConfig();

      expect(config2.maxAttempts).not.toBe(999);
    });
  });

  describe('destroy', () => {
    it('deve limpar recursos', () => {
      rateLimitService.recordAttempt('test@example.com', false);

      rateLimitService.destroy();

      const stats = rateLimitService.getStats('test@example.com');
      expect(stats).toBeNull();
    });
  });
});
