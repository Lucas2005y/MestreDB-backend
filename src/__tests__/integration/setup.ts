import { DataSource } from 'typeorm';
import { UserTest as UserEntity } from './entities/User.test';

/**
 * Configuração do banco de dados para testes de integração
 * Usa um banco de dados em memória SQLite para testes rápidos e isolados
 */
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // Banco em memória para testes
  synchronize: true, // Auto-sync para testes
  logging: false, // Desabilitar logs durante testes
  entities: [UserEntity],
  dropSchema: true, // Limpar schema a cada execução
  // Configurações específicas para SQLite
  extra: {
    // Configurações adicionais se necessário
  }
});

/**
 * Configuração global para testes de integração
 */
export class IntegrationTestSetup {
  static async setupDatabase(): Promise<void> {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
  }

  static async teardownDatabase(): Promise<void> {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
    }
  }

  static async clearDatabase(): Promise<void> {
    if (TestDataSource.isInitialized) {
      const entities = TestDataSource.entityMetadatas;
      
      for (const entity of entities) {
        const repository = TestDataSource.getRepository(entity.name);
        await repository.clear();
      }
    }
  }
}

// Exportar funções para uso em testes específicos
export const initializeTestDatabase = () => IntegrationTestSetup.setupDatabase();
export const destroyTestDatabase = () => IntegrationTestSetup.teardownDatabase();
export const clearTestDatabase = () => IntegrationTestSetup.clearDatabase();

// Configuração global para todos os testes de integração
beforeAll(async () => {
  await IntegrationTestSetup.setupDatabase();
});

afterAll(async () => {
  await IntegrationTestSetup.teardownDatabase();
});

beforeEach(async () => {
  await IntegrationTestSetup.clearDatabase();
});