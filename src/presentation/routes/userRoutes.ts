import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware';
import { 
  requireSuperUser,
  requireOwnershipOrSuperUser,
  requireOwnershipOrSuperUserForModification,
  requireOwnershipOrSuperUserForDeletion,
  requireSuperUserForListing,
  requireSuperUserForCreation
} from '../middlewares/authorizationMiddleware';
import { apiRateLimit, sensitiveOperationsRateLimit } from '../middlewares/rateLimitMiddleware';
import { ControllerFactory } from '../../shared/container/ServiceRegistry';

const router = Router();
const userController = ControllerFactory.createUserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         is_superuser:
 *           type: boolean
 *           description: Indica se o usuário é administrador
 *         last_access:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data do último acesso
 *         last_login:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Data do último login
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *     CreateUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 80
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           description: Email do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Senha do usuário
 *         is_superuser:
 *           type: boolean
 *           default: false
 *           description: Indica se o usuário é administrador
 *     UpdateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 80
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 254
 *           description: Email do usuário
 *         password:
 *           type: string
 *           minLength: 6
 *           description: Nova senha do usuário
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *         message:
 *           type: string
 *           description: Mensagem descritiva da operação
 *         data:
 *           description: Dados retornados pela operação
 *     PaginatedUsers:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         total:
 *           type: integer
 *           description: Total de usuários
 *         page:
 *           type: integer
 *           description: Página atual
 *         limit:
 *           type: integer
 *           description: Limite de itens por página
 *         totalPages:
 *           type: integer
 *           description: Total de páginas
 *   tags:
 *     - name: Usuários
 *       description: Operações relacionadas aos usuários
 */

// Rotas para usuários

// Rotas específicas do usuário logado (devem vir antes das rotas com parâmetros)
router.get('/me', authenticateToken, apiRateLimit, userController.getMyProfile.bind(userController));
router.put('/me', authenticateToken, apiRateLimit, userController.updateMyProfile.bind(userController));

// Rotas administrativas
router.post('/', authenticateToken, requireSuperUserForCreation, sensitiveOperationsRateLimit, userController.createUser.bind(userController));

// Rotas de consulta
router.get('/', authenticateToken, requireSuperUserForListing, apiRateLimit, userController.getAllUsers.bind(userController));

// Rotas com parâmetros (devem vir por último)
router.get('/:id', authenticateToken, requireOwnershipOrSuperUser, apiRateLimit, userController.getUserById.bind(userController));

// Rotas de modificação
router.put('/:id', authenticateToken, requireOwnershipOrSuperUserForModification, sensitiveOperationsRateLimit, userController.updateUser.bind(userController));

// Rotas de exclusão
router.delete('/:id', authenticateToken, requireOwnershipOrSuperUserForDeletion, sensitiveOperationsRateLimit, userController.deleteUser.bind(userController));

export default router;