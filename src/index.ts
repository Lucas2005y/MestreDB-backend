console.log('🚀 INICIANDO APLICAÇÃO - index.ts carregado');

import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

console.log('🔧 Variáveis de ambiente carregadas');

import { DatabaseInitializer } from './infrastructure/config/DatabaseInitializer';
import { setupSwagger } from './infrastructure/config/swagger';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';
import { corsMiddleware } from './presentation/middlewares/cors';
import { generalRateLimit } from './presentation/middlewares/rateLimitMiddleware';
import { configureServices } from './shared/container/ServiceRegistry';

// Configure dependency injection BEFORE importing routes
console.log('🔧 Configurando injeção de dependência...');
configureServices();
console.log('✅ Serviços configurados');

console.log('📋 Importando apiRoutes...');
import apiRoutes from './presentation/routes';
console.log('✅ apiRoutes importado');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(generalRateLimit); // Rate limiting geral para toda a aplicação
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const logMessage = `🌐 REQUISIÇÃO: ${req.method} ${req.url}`;
  console.log(logMessage);
  process.stdout.write(logMessage + '\n');
  next();
});

// Setup Swagger documentation
setupSwagger(app);



// API routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bem-vindo à API MestreDB',
    version: '1.0.0',
    documentation: '/api-docs',
    api: '/api',
    health: '/api/health'
  });
});

// Error handling middleware (deve ser o último)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await DatabaseInitializer.initialize();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 Documentação: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      
      // Debug: Testar se as rotas estão funcionando
      setTimeout(() => {
        console.log('🔍 Testando rotas internas...');
        // Simular uma requisição interna para verificar se as rotas estão funcionando
        const req = { method: 'POST', url: '/api/auth/login', body: {} };
        console.log('📝 Simulando requisição:', req);
      }, 1000);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n🛑 Recebido sinal ${signal}. Encerrando servidor...`);
  
  try {
    await DatabaseInitializer.close();
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar servidor:', error);
    process.exit(1);
  }
};

// Handle different termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
startServer();