import { Request, Response } from 'express';
import { HealthController } from '../../../presentation/controllers/HealthController';
import { HealthService } from '../../../application/services/HealthService';

// Mock do HealthService
jest.mock('../../../application/services/HealthService');

describe('HealthController', () => {
  let healthController: HealthController;
  let mockHealthService: jest.Mocked<HealthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    healthController = new HealthController();
    mockHealthService = (healthController as any).healthService as jest.Mocked<HealthService>;
  });

  describe('health', () => {
    it('deve retornar 200 quando aplicação está healthy', async () => {
      const healthData = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        uptime: 100,
        version: '1.0.0',
        environment: 'test',
        responseTime: 50,
        services: {
          database: { status: 'healthy' as const, responseTime: 10 }
        },
        memory: { heapUsed: '100 MB', heapTotal: '200 MB', rss: '300 MB', external: '50 MB', percentage: 50 },
        system: { platform: 'linux', nodeVersion: '18.0.0', pid: 1234 }
      } as any;

      mockHealthService.checkHealth.mockResolvedValue(healthData);

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(healthData);
    });

    it('deve retornar 200 quando aplicação está degraded', async () => {
      const healthData = {
        status: 'degraded' as const,
        timestamp: new Date().toISOString(),
        uptime: 100,
        version: '1.0.0',
        environment: 'test',
        responseTime: 50,
        services: {
          database: { status: 'degraded' as const, responseTime: 1500 }
        },
        memory: { heapUsed: '100 MB', heapTotal: '200 MB', rss: '300 MB', external: '50 MB', percentage: 50 },
        system: { platform: 'linux', nodeVersion: '18.0.0', pid: 1234 }
      } as any;

      mockHealthService.checkHealth.mockResolvedValue(healthData);

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('deve retornar 503 quando aplicação está unhealthy', async () => {
      const healthData = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        uptime: 100,
        version: '1.0.0',
        environment: 'test',
        responseTime: 50,
        services: {
          database: { status: 'unhealthy' as const, error: 'Connection failed' }
        },
        memory: { heapUsed: '100 MB', heapTotal: '200 MB', rss: '300 MB', external: '50 MB', percentage: 50 },
        system: { platform: 'linux', nodeVersion: '18.0.0', pid: 1234 }
      } as any;

      mockHealthService.checkHealth.mockResolvedValue(healthData);

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(healthData);
    });

    it('deve retornar 503 em caso de erro', async () => {
      mockHealthService.checkHealth.mockRejectedValue(new Error('Service error'));

      await healthController.health(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'unhealthy',
          error: 'Service error'
        })
      );
    });
  });

  describe('readiness', () => {
    it('deve retornar 200 quando aplicação está pronta', async () => {
      mockHealthService.checkReadiness.mockResolvedValue(true);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready'
        })
      );
    });

    it('deve retornar 503 quando aplicação não está pronta', async () => {
      mockHealthService.checkReadiness.mockResolvedValue(false);

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'not ready'
        })
      );
    });

    it('deve retornar 503 em caso de erro', async () => {
      mockHealthService.checkReadiness.mockRejectedValue(new Error('Check failed'));

      await healthController.readiness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'not ready',
          error: 'Check failed'
        })
      );
    });
  });

  describe('liveness', () => {
    it('deve retornar 200 quando aplicação está viva', () => {
      mockHealthService.checkLiveness.mockReturnValue(true);

      healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'alive'
        })
      );
    });

    it('deve retornar 503 quando aplicação está morta', () => {
      mockHealthService.checkLiveness.mockReturnValue(false);

      healthController.liveness(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'dead'
        })
      );
    });
  });

  describe('simple', () => {
    it('deve retornar resposta simples de sucesso', () => {
      healthController.simple(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'API está funcionando'
        })
      );
    });
  });
});
