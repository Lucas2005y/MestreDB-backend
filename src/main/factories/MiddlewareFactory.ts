import { Application, Express } from 'express';
import express from 'express';
import { corsMiddleware } from '../../presentation/middlewares/cors';
import { generalRateLimit } from '../../presentation/middlewares/rateLimitMiddleware';
import { setupSwagger } from '../../infrastructure/config/swagger';
import { errorHandler, notFoundHandler } from '../../presentation/middlewares/errorHandler';

/**
 * Factory responsável por configurar middlewares da aplicação
 */
export class MiddlewareFactory {
  /**
   * Configura middlewares globais da aplicação
   */
  static configureGlobalMiddlewares(app: Application): void {
    // Middlewares de segurança e CORS
    app.use(corsMiddleware);
    app.use(generalRateLimit);
    
    // Middlewares de parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Middleware de logging
    this.configureRequestLogging(app);

    // Documentação Swagger
    setupSwagger(app as Express);
  }

  /**
   * Configura logging de requisições
   */
  private static configureRequestLogging(app: Application): void {
    app.use((req, _res, next) => {
      const logMessage = `🌐 REQUISIÇÃO: ${req.method} ${req.url}`;
      console.log(logMessage);
      process.stdout.write(logMessage + '\n');
      next();
    });
  }

  /**
   * Configura tratamento de erros (deve ser chamado por último)
   */
  static configureErrorHandling(app: Application): void {
    app.use(notFoundHandler);
    app.use(errorHandler);
  }
}