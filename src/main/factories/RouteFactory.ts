import { Application } from 'express';

/**
 * Factory responsável por configurar rotas da aplicação
 */
export class RouteFactory {
  /**
   * Configura todas as rotas da aplicação
   */
  static async configureRoutes(app: Application): Promise<void> {
    // Rotas da API (importadas dinamicamente após bootstrap/DI)
    const { default: apiRoutes } = await import('../../presentation/routes');
    app.use('/api', apiRoutes);

    // Rota raiz
    this.configureRootRoute(app);
  }

  /**
   * Configura rota raiz da aplicação
   */
  private static configureRootRoute(app: Application): void {
    app.get('/', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Bem-vindo à API MestreDB',
        version: '1.0.0',
        documentation: '/api-docs',
        api: '/api',
        health: '/api/health',
      });
    });
  }
}