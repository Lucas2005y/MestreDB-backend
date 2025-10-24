import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const authController = new AuthController();

console.log('📋 Carregando authRoutes...');

// Rotas de autenticação
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.me);

console.log('✅ authRoutes carregado com sucesso');

export default router;