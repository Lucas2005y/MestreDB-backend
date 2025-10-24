import { AppDataSource } from './database';
import { UserRepository } from '../repositories/UserRepository';
import * as bcrypt from 'bcrypt';

export class DatabaseInitializer {
  static async initialize(): Promise<void> {
    try {
      // Inicializar conexão com o banco
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('✅ Conexão com MySQL estabelecida com sucesso');
      }

      // Sincronizar esquema do banco (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        await AppDataSource.synchronize();
        console.log('✅ Esquema do banco sincronizado');
      }

      // Criar usuário administrador padrão se não existir
      await this.createDefaultAdmin();

    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  private static async createDefaultAdmin(): Promise<void> {
    try {
      const userRepository = new UserRepository();
      
      // Verificar se já existe um usuário administrador
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@mestredb.com';
      const existingAdmin = await userRepository.findByEmail(adminEmail);

      if (!existingAdmin) {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        await userRepository.create({
          name: 'Administrador',
          email: adminEmail,
          password: hashedPassword,
          is_superuser: true
        });

        console.log('✅ Usuário administrador padrão criado');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Senha: ${adminPassword}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário administrador padrão:', error);
    }
  }

  static async close(): Promise<void> {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Conexão com banco de dados fechada');
    }
  }
}