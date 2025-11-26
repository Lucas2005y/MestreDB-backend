import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Mesma configuração do database.ts, mas para CLI
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3307'),
  username: process.env.DB_USERNAME || process.env.MYSQL_USERNAME || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'mestredb_sql',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/domain/entities/**/*.ts', 'src/infrastructure/database/entities/**/*.ts'],
  migrations: ['src/infrastructure/database/migrations/**/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/**/*.ts'],
});
