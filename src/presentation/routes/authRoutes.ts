import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { loginRateLimit, registerRateLimit } from '../middlewares/rateLimitMiddleware';

const router = Router();
const authController = new AuthController();

console.log('📋 Carregando authRoutes...');

// Rotas de autenticação
router.post('/login', loginRateLimit, authController.login);
router.post('/register', registerRateLimit, authController.register); // Rota pública para registro
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.me);

console.log('✅ authRoutes carregado com sucesso');

export default router;