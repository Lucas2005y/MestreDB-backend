import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Carrega variáveis de ambiente baseado no NODE_ENV
 *
 * Ordem de prioridade:
 * 1. .env.{NODE_ENV} (ex: .env.development, .env.production)
 * 2. .env (fallback para compatibilidade)
 *
 * @example
 * // Desenvolvimento
 * NODE_ENV=development -> carrega .env.development
 *
 * // Produção
 * NODE_ENV=production -> carrega .env.production
 *
 * // Sem NODE_ENV definido
 * -> carrega .env (comportamento atual mantido)
 */
export function loadEnvironment(): void {
  const env = process.env.NODE_ENV || 'development';
  const envFile = `.env.${env}`;
  const envPath = path.resolve(process.cwd(), envFile);

  console.log(`🔍 Tentando carregar: ${envFile}`);

  // Tentar carregar arquivo específico do ambiente
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    // Fallback para .env genérico (compatibilidade com setup atual)
    console.log(`⚠️  ${envFile} não encontrado, usando .env (fallback)`);
    dotenv.config();
  } else {
    console.log(`✅ Ambiente carregado: ${env} (${envFile})`);
  }

  // Validar que NODE_ENV está definido
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('📝 NODE_ENV não definido, usando: development');
  }
}
