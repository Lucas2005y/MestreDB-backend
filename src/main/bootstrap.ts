import 'reflect-metadata';
import dotenv from 'dotenv';

/**
 * Inicializa variáveis de ambiente e configura o container de DI
 */
export async function bootstrap(): Promise<void> {
  console.log('🚀 bootstrap: carregando variáveis de ambiente e DI');
  // Carregar variáveis de ambiente primeiro
  dotenv.config();
  console.log('🔧 bootstrap: variáveis de ambiente carregadas');

  // Importar e configurar DI somente após dotenv
  console.log('🔧 bootstrap: configurando serviços de DI...');
  const { configureServices } = await import('../shared/container/ServiceRegistry');
  configureServices();
  console.log('✅ bootstrap: serviços configurados');
}