import express, { Application } from 'express';
import { MiddlewareFactory } from './MiddlewareFactory';
import { RouteFactory } from './RouteFactory';

/**
 * Factory responsável por criar e configurar a aplicação Express
 */
export class AppFactory {
  /**
   * Cria uma aplicação Express completamente configurada
   */
  static async create(): Promise<Application> {
    const app = express();

    // Configurar middlewares através da factory
    MiddlewareFactory.configureGlobalMiddlewares(app);
    
    // Configurar rotas através da factory
    await RouteFactory.configureRoutes(app);
    
    // Configurar tratamento de erros
    MiddlewareFactory.configureErrorHandling(app);

    return app;
  }
}