import { Request, Response } from 'express';
import { HealthService } from '../../application/services/HealthService';

/**
 * Controller responsável pelos endpoints de health check
 */
export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Verifica saúde completa da aplicação
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Aplicação saudável
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [healthy, degraded, unhealthy]
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   *                 version:
   *                   type: string
   *                 environment:
   *                   type: string
   *                 responseTime:
   *                   type: number
   *                 services:
   *                   type: object
   *                   properties:
   *                     database:
   *                       type: object
   *                       properties:
   *                         status:
   *                           type: string
   *                         responseTime:
   *                           type: number
   *                 memory:
   *                   type: object
   *                 system:
   *                   type: object
   *       503:
   *         description: Aplicação não saudável
   */
  health = async (req: Request, res: Response): Promise<void> => {
    try {
      const healthCheck = await this.healthService.checkHealth();

      // Retorna 503 se unhealthy, 200 caso contrário
      const statusCode = healthCheck.status === 'unhealthy' ? 503 : 200;

      res.status(statusCode).json(healthCheck);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      });
    }
  };

  /**
   * @swagger
   * /health/ready:
   *   get:
   *     summary: Verifica se aplicação está pronta (Kubernetes Readiness Probe)
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Aplicação pronta para receber tráfego
   *       503:
   *         description: Aplicação não está pronta
   */
  readiness = async (req: Request, res: Response): Promise<void> => {
    try {
      const isReady = await this.healthService.checkReadiness();

      if (isReady) {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'not ready',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Readiness check failed',
      });
    }
  };

  /**
   * @swagger
   * /health/live:
   *   get:
   *     summary: Verifica se aplicação está viva (Kubernetes Liveness Probe)
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Aplicação está viva
   */
  liveness = (req: Request, res: Response): void => {
    const isAlive = this.healthService.checkLiveness();

    if (isAlive) {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
      });
    } else {
      res.status(503).json({
        status: 'dead',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Endpoint simples para verificação rápida (compatibilidade)
   */
  simple = (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'API está funcionando',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  };
}
