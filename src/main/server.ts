import { Application } from 'express';
import { bootstrap } from './bootstrap';
import { createApp } from './app';
import { DatabaseInitializer } from '../infrastructure/config/DatabaseInitializer';
import { ServerFactory } from './factories/ServerFactory';

/**
 * Inicializa e executa o servidor
 */
export async function startServer(): Promise<void> {
  try {
    // 1. Bootstrap: configurar variáveis de ambiente e DI
    await bootstrap();

    // 2. Criar aplicação Express
    const app = await createApp();

    // 3. Inicializar banco de dados (importação dinâmica após dotenv)
    const { DatabaseInitializer } = await import('../infrastructure/config/DatabaseInitializer');
    await DatabaseInitializer.initialize();

    // 4. Iniciar servidor usando factory
    const port = Number(process.env.PORT) || 3000;
    const environment = process.env.NODE_ENV || 'development';
    
    const server = ServerFactory.create(app, { port, environment });

    // 5. Configurar encerramento gracioso
    ServerFactory.configureGracefulShutdown(server);

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Executar servidor
startServer();