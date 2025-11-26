import { AppDataSource } from '../../infrastructure/config/database';
import { logger } from '../../shared/utils/logger';

/**
 * Status de saúde de um serviço
 */
export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Status de memória
 */
export interface MemoryStatus {
  heapUsed: string;
  heapTotal: string;
  rss: string;
  external: string;
  percentage: number;
}

/**
 * Resposta completa do health check
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  responseTime: number;
  services: {
    database: ServiceHealth;
  };
  memory: MemoryStatus;
  system: {
    platform: string;
    nodeVersion: string;
    pid: number;
  };
}

/**
 * Serviço responsável por verificar a saúde da aplicação
 */
export class HealthService {
  /**
   * Executa verificação completa de saúde
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const startTime = Date.now();

    // Verificações paralelas para melhor performance
    const [databaseHealth] = await Promise.all([
      this.checkDatabase(),
    ]);

    const memory = this.checkMemory();
    const system = this.getSystemInfo();

    // Determina status geral
    const overallStatus = this.determineOverallStatus([databaseHealth]);

    const response: HealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime,
      services: {
        database: databaseHealth,
      },
      memory,
      system,
    };

    // Log do health check
    if (overallStatus !== 'healthy') {
      logger.warn('Health check detectou problemas', response);
    } else {
      logger.debug('Health check executado com sucesso', {
        status: overallStatus,
        responseTime: response.responseTime,
      });
    }

    return response;
  }

  /**
   * Verifica saúde do banco de dados
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();

    try {
      // Verifica se está inicializado
      if (!AppDataSource.isInitialized) {
        return {
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          error: 'Database not initialized',
        };
      }

      // Executa query simples para testar conexão
      await AppDataSource.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      // Considera degraded se resposta for muito lenta (> 1000ms)
      const status = responseTime > 1000 ? 'degraded' : 'healthy';

      return {
        status,
        responseTime,
        details: {
          type: AppDataSource.options.type,
          database: AppDataSource.options.database,
        },
      };
    } catch (error) {
      logger.error('Database health check failed', { error });

      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifica uso de memória
   */
  private checkMemory(): MemoryStatus {
    const usage = process.memoryUsage();

    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);
    const externalMB = Math.round(usage.external / 1024 / 1024);

    const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);

    return {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      rss: `${rssMB}MB`,
      external: `${externalMB}MB`,
      percentage,
    };
  }

  /**
   * Obtém informações do sistema
   */
  private getSystemInfo() {
    return {
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
    };
  }

  /**
   * Determina status geral baseado nos serviços
   */
  private determineOverallStatus(
    services: ServiceHealth[]
  ): 'healthy' | 'unhealthy' | 'degraded' {
    const hasUnhealthy = services.some((s) => s.status === 'unhealthy');
    const hasDegraded = services.some((s) => s.status === 'degraded');

    if (hasUnhealthy) {
      return 'unhealthy';
    }

    if (hasDegraded) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Verifica se a aplicação está pronta para receber tráfego
   * (Usado para readiness probe do Kubernetes)
   */
  async checkReadiness(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy' || health.status === 'degraded';
    } catch (error) {
      logger.error('Readiness check failed', { error });
      return false;
    }
  }

  /**
   * Verifica se a aplicação está viva
   * (Usado para liveness probe do Kubernetes)
   */
  checkLiveness(): boolean {
    // Verifica se o processo está respondendo
    return true;
  }
}
