import { HealthService } from '../../../application/services/HealthService';
import { AppDataSource } from '../../../infrastructure/config/database';

// Mock do AppDataSource
jest.mock('../../../infrastructure/config/database', () => ({
  AppDataSource: {
    isInitialized: true,
    query: jest.fn(),
    options: {
      type: 'mysql',
      database: 'test_db',
    },
  },
}));

describe('HealthService', () => {
  let healthService: HealthService;
  let mockAppDataSource: jest.Mocked<typeof AppDataSource>;

  beforeEach(() => {
    healthService = new HealthService();
    mockAppDataSource = AppDataSource as jest.Mocked<typeof AppDataSource>;
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('deve retornar status healthy quando tudo está OK', async () => {
      mockAppDataSource.query.mockResolvedValue([{ result: 1 }]);

      const result = await healthService.checkHealth();

      expect(result.status).toBe('healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('system');
    });

    it('deve incluir informações do banco de dados', async () => {
      mockAppDataSource.query.mockResolvedValue([{ result: 1 }]);

      const result = await healthService.checkHealth();

      expect(result.services.database).toHaveProperty('status');
      expect(result.services.database).toHaveProperty('responseTime');
      expect(result.services.database.status).toBe('healthy');
    });

    it('deve retornar unhealthy quando banco falha', async () => {
      mockAppDataSource.query.mockRejectedValue(new Error('Connection failed'));

      const result = await healthService.checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('unhealthy');
      expect(result.services.database).toHaveProperty('error');
    });

    it('deve retornar degraded quando banco está lento', async () => {
      // Simular resposta lenta
      mockAppDataSource.query.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([{ result: 1 }]), 1100))
      );

      const result = await healthService.checkHealth();

      expect(result.services.database.status).toBe('degraded');
      expect(result.services.database.responseTime).toBeGreaterThan(1000);
    });

    it('deve incluir informações de memória', async () => {
      mockAppDataSource.query.mockResolvedValue([{ result: 1 }]);

      const result = await healthService.checkHealth();

      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.memory).toHaveProperty('heapTotal');
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('percentage');
      expect(typeof result.memory.percentage).toBe('number');
    });

    it('deve incluir informações do sistema', async () => {
      mockAppDataSource.query.mockResolvedValue([{ result: 1 }]);

      const result = await healthService.checkHealth();

      expect(result.system).toHaveProperty('platform');
      expect(result.system).toHaveProperty('nodeVersion');
      expect(result.system).toHaveProperty('pid');
    });

    it('deve ter tempo de resposta rápido', async () => {
      mockAppDataSource.query.mockResolvedValue([{ result: 1 }]);

      const start = Date.now();
      await healthService.checkHealth();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });

  describe('checkReadiness', () => {
    it('deve retornar true quando aplicação está pronta', async () => {
      mockAppDataSource.query.mockResolvedValue([{ result: 1 }]);

      const result = await healthService.checkReadiness();

      expect(result).toBe(true);
    });

    it('deve retornar false quando há problemas', async () => {
      mockAppDataSource.query.mockRejectedValue(new Error('Database down'));

      const result = await healthService.checkReadiness();

      expect(result).toBe(false);
    });

    it('deve aceitar status degraded como ready', async () => {
      // Simular resposta lenta (degraded)
      mockAppDataSource.query.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([{ result: 1 }]), 1100))
      );

      const result = await healthService.checkReadiness();

      expect(result).toBe(true); // degraded ainda é considerado ready
    });
  });

  describe('checkLiveness', () => {
    it('deve sempre retornar true se processo está rodando', () => {
      const result = healthService.checkLiveness();

      expect(result).toBe(true);
    });
  });

  describe('Database not initialized', () => {
    it('deve retornar unhealthy quando banco não está inicializado', async () => {
      Object.defineProperty(mockAppDataSource, 'isInitialized', {
        value: false,
        writable: true,
        configurable: true
      });

      const result = await healthService.checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.services.database.status).toBe('unhealthy');
      expect(result.services.database.error).toContain('not initialized');
    });
  });
});
