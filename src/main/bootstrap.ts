import 'reflect-metadata';
import { loadEnvironment } from '../infrastructure/config/environment';

/**
 * Inicializa variáveis de ambiente e configura o container de DI
 */
export async function bootstrap(): Promise<void> {
  console.log('🚀 bootstrap: carregando variáveis de ambiente e DI');

  // Carregar variáveis de ambiente primeiro (com suporte a múltiplos ambientes)
  loadEnvironment();
  console.log('🔧 bootstrap: variáveis de ambiente carregadas');

  // Importar e configurar DI somente após carregar ambiente
  console.log('🔧 bootstrap: configurando serviços de DI...');
  const { configureServices } = await import('../shared/container/ServiceRegistry');
  configureServices();
  console.log('✅ bootstrap: serviços configurados');
}