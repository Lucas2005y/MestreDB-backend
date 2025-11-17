import { Application } from 'express';
import { Server } from 'http';

/**
 * Configuração do servidor
 */
interface ServerConfig {
  port: number;
  environment: string;
}

/**
 * Factory responsável por criar e configurar o servidor HTTP
 */
export class ServerFactory {
  private static gracefulShutdownConfigured = false;
  /**
   * Cria e inicia o servidor HTTP
   */
  static create(app: Application, config: ServerConfig): Server {
    const server = app.listen(config.port, () => {
      console.log(`🚀 Servidor rodando na porta ${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
      console.log(`📚 Documentação: http://localhost:${config.port}/api-docs`);
      console.log(`🔗 API: http://localhost:${config.port}/api`);
      console.log(`🌍 Ambiente: ${config.environment}`);
    });

    return server;
  }

  /**
   * Configura encerramento gracioso do servidor
   */
  static configureGracefulShutdown(server: Server): void {
    // Prevenir configuração duplicada
    if (this.gracefulShutdownConfigured) {
      console.log('⚠️ Graceful shutdown já configurado, ignorando...');
      return;
    }
    this.gracefulShutdownConfigured = true;
    console.log('🔧 Configurando graceful shutdown...');

    let isShuttingDown = false;

    const gracefulShutdown = async (signal: string) => {
      // Prevenir múltiplas execuções
      if (isShuttingDown) {
        console.log(`⚠️ Shutdown já em andamento, ignorando sinal ${signal}`);
        return;
      }
      isShuttingDown = true;

      console.log(`\n🛑 Sinal ${signal} recebido. Encerrando servidor...`);
      try {
        // Importar DatabaseInitializer dinamicamente
        const { DatabaseInitializer } = await import('../../infrastructure/config/DatabaseInitializer');
        await DatabaseInitializer.close();

        server.close(() => {
          console.log('✅ Servidor encerrado com sucesso');
          process.exit(0);
        });

        // Fallback se não encerrar em tempo hábil
        setTimeout(() => {
          console.error('⏱️ Timeout de shutdown. Forçando encerramento.');
          process.exit(1);
        }, 10_000);
      } catch (error) {
        console.error('❌ Erro ao encerrar servidor:', error);
        process.exit(1);
      }
    };

    // Registrar handlers de encerramento (apenas uma vez cada)
    process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}