import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

import { DatabaseInitializer } from './infrastructure/config/DatabaseInitializer';
import { setupSwagger } from './infrastructure/config/swagger';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';
import { corsMiddleware } from './presentation/middlewares/cors';
import apiRoutes from './presentation/routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
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