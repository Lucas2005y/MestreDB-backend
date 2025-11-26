import 'reflect-metadata';
import { loadEnvironment } from '../infrastructure/config/environment';
import { validateEnv } from '../infrastructure/config/envValidator';
import { logger } from '../shared/utils/logger';

/**
 * Inicializa variáveis de ambiente e configura o container de DI
 */
export async function bootstrap(): Promise<void> {
  logger.info('Bootstrap: Iniciando aplicação');

  // 1. Carregar variáveis de ambiente primeiro (com suporte a múltiplos ambientes)
  loadEnvironment();

  // 2. Validar variáveis de ambiente (falha rápida se configuração inválida)
  try {
    validateEnv();
  } catch (error) {
    logger.error('Falha na validação de variáveis de ambiente', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
    console.error('\n❌ Falha na validação de variáveis de ambiente');
    console.error('   O servidor não pode iniciar com configuração inválida.\n');
    process.exit(1);
  }

  // 3. Importar e configurar DI somente após validação bem-sucedida
  logger.info('Bootstrap: Configurando serviços de DI');
  const { configureServices } = await import('../shared/container/ServiceRegistry');
  configureServices();
  logger.info('Bootstrap: Serviços configurados com sucesso');
}