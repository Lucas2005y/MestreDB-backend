import { Router } from 'express';

console.log('📋 Carregando routes/index.ts...');

import userRoutes from './userRoutes';
console.log('✅ userRoutes importado');

import authRoutes from './authRoutes';
console.log('✅ authRoutes importado');

const router = Router();
console.log('✅ Router criado');

// Debug middleware
router.use((req, res, next) => {
  const msg = `🔍 ROUTES DEBUG: ${req.method} ${req.url}`;
  console.log(msg);
  process.stdout.write(msg + '\n');
  next();
});

// Rotas da API
router.use('/auth', (req, res, next) => {
  console.log(`🔐 MIDDLEWARE AUTH - Redirecionando para authRoutes: ${req.method} ${req.url}`);
  next();
}, authRoutes);

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