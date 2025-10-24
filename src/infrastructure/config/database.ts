import { DataSource } from 'typeorm';
import { User } from '../database/entities/User';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'mestredb_sql',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync em desenvolvimento
  logging: process.env.NODE_ENV === 'development',
  entities: [User],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error);
    process.exit(1);
  }
};