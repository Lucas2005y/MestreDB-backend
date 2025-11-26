import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const healthController = new HealthController();

/**
 * Rotas de Health Check
 */

// Health check completo
router.get('/', healthController.health);

// Kubernetes Readiness Probe
router.get('/ready', healthController.readiness);

// Kubernetes Liveness Probe
router.get('/live', healthController.liveness);

// Endpoint simples (compatibilidade)
router.get('/simple', healthController.simple);

export default router;
