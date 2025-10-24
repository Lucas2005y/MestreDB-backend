import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

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
router.post('/', userController.createUser.bind(userController));
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.put('/:id', userController.updateUser.bind(userController));
router.delete('/:id', userController.deleteUser.bind(userController));

export default router;