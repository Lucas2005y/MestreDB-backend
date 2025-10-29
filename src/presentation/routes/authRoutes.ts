import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { registerRateLimit } from '../middlewares/rateLimitMiddleware';
import { CustomRateLimitMiddleware } from '../middlewares/customRateLimitMiddleware';
import { ControllerFactory, TYPES } from '../../shared/container/ServiceRegistry';
import { container } from '../../shared/container/DIContainer';
import { RateLimitingService } from '../../application/services/RateLimitingService';

const router = Router();
const authController = ControllerFactory.createAuthController();

// Instanciar middleware customizado de rate limiting
const rateLimitingService = container.resolve<RateLimitingService>(TYPES.RateLimitingService);
const customRateLimit = new CustomRateLimitMiddleware(rateLimitingService);

console.log('📋 Carregando authRoutes...');

// Rotas de autenticação
router.post('/login', 
  customRateLimit.loginRateLimit, 
  customRateLimit.recordLoginAttempt, 
  authController.login
);
router.post('/register', registerRateLimit, authController.register); // Rota pública para registro
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.me);

// Rotas de debug para rate limiting (apenas para testes)
router.get('/rate-limit/status', customRateLimit.getStatus);
router.post('/rate-limit/reset', customRateLimit.reset);

console.log('✅ authRoutes carregado com sucesso');

export default router;