import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// Rotas da API
router.use('/usuarios', userRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota raiz da API
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bem-vindo à API MestreDB',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

export default router;