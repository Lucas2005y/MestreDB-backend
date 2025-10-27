import { Request, Response } from 'express';
import { AuthUseCases, LoginDTO } from '../../application/usecases/AuthUseCases';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { AuditLogger } from '../../shared/utils/auditLogger';

interface LoginRequestDTO {
  email: string;
  password: string;
}

interface RefreshTokenRequestDTO {
  refreshToken: string;
}

interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export class AuthController {
  private authUseCases: AuthUseCases;

  constructor() {
    console.log('🔧 Inicializando AuthController...');
    const userRepository = new UserRepository();
    this.authUseCases = new AuthUseCases(userRepository);
    console.log('✅ AuthController inicializado com sucesso');
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Fazer login na aplicação
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: admin@mestredb.com
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: admin123
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Login realizado com sucesso
   *                 token:
   *                   type: string
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                 refreshToken:
   *                   type: string
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: number
   *                       example: 1
   *                     name:
   *                       type: string
   *                       example: Administrador
   *                     email:
   *                       type: string
   *                       example: admin@mestredb.com
   *                     is_superuser:
   *                       type: boolean
   *                       example: true
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Credenciais inválidas
   */
  login = async (req: Request, res: Response): Promise<void> => {
    console.log('🔐 Tentativa de login recebida:', { email: req.body?.email });
    try {
      // Validar dados de entrada básica
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: 'Email e senha são obrigatórios'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: 'Senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      // Realizar login
      const authResponse = await this.authUseCases.login({ email, password });

      // Log de auditoria para login bem-sucedido
      AuditLogger.log(req, 'LOGIN', 'AUTH', authResponse.user.id, true, {
        userEmail: email,
        userId: authResponse.user.id
      });

      res.status(200).json({
        message: 'Login realizado com sucesso',
        ...authResponse
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('Credenciais inválidas')) {
        // Log de auditoria para tentativa de login falhada
        AuditLogger.log(req, 'LOGIN_FAILED', 'AUTH', undefined, false, {
          userEmail: req.body?.email,
          reason: 'Credenciais inválidas'
        });

        res.status(401).json({
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos'
        });
      } else {
        // Log de auditoria para erro interno
        AuditLogger.log(req, 'LOGIN_ERROR', 'AUTH', undefined, false, {
          userEmail: req.body?.email,
          error: errorMessage
        });

        res.status(500).json({
          error: 'Erro interno',
          message: errorMessage
        });
      }
    }
  };

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Registrar nova conta de usuário (público)
   *     description: Permite registro público de usuários normais. Superusuários só podem ser criados por administradores.
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 2
   *                 example: João Silva
   *               email:
   *                 type: string
   *                 format: email
   *                 example: joao@exemplo.com
   *               password:
   *                 type: string
   *                 minLength: 8
   *                 example: minhasenha123
   *     responses:
   *       201:
   *         description: Usuário registrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Usuário registrado com sucesso
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "1"
   *                     name:
   *                       type: string
   *                       example: João Silva
   *                     email:
   *                       type: string
   *                       example: joao@exemplo.com
   *                     is_superuser:
   *                       type: boolean
   *                       example: false
   *       400:
   *         description: Dados inválidos
   *       403:
   *         description: Tentativa de definir privilégios de superusuário
   *       409:
   *         description: Email já cadastrado
   *       500:
   *         description: Erro interno do servidor
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📝 Tentativa de registro:', { email: req.body.email, name: req.body.name });
      
      const { name, email, password }: RegisterRequestDTO = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        res.status(400).json({
          error: 'Dados incompletos',
          message: 'Nome, email e senha são obrigatórios'
        });
        return;
      }

      // SEGURANÇA: Verificar se tentaram enviar is_superuser
      if (req.body.is_superuser !== undefined) {
        res.status(403).json({
          error: 'Acesso negado',
          message: 'Não é possível definir privilégios de superusuário no registro público'
        });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({
          error: 'Senha inválida',
          message: 'Senha deve ter pelo menos 8 caracteres'
        });
        return;
      }

      // Criar usuário através do use case
      const result = await this.authUseCases.register({
        name,
        email,
        password,
        is_superuser: false // Usuários registrados publicamente não são super usuários
      });

      console.log('✅ Usuário registrado com sucesso:', { id: result.user.id, email: result.user.email });

      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token: result.token,
        refreshToken: result.refreshToken,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          is_superuser: result.user.is_superuser
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      console.error('❌ Erro no registro:', errorMessage);
      
      if (errorMessage.includes('já existe') || errorMessage.includes('already exists')) {
        res.status(409).json({
          error: 'Email já cadastrado',
          message: 'Este email já está sendo usado por outro usuário'
        });
      } else if (errorMessage.includes('inválido') || errorMessage.includes('invalid')) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: errorMessage
        });
      } else {
        res.status(500).json({
          error: 'Erro interno',
          message: 'Erro interno do servidor'
        });
      }
    }
  };

  /**
   * @swagger
   * /auth/refresh:
   *   post:
   *     summary: Renovar token de acesso
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *     responses:
   *       200:
   *         description: Token renovado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Token renovado com sucesso
   *                 token:
   *                   type: string
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                 refreshToken:
   *                   type: string
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *                 user:
   *                   type: object
   *       400:
   *         description: Refresh token inválido
   *       401:
   *         description: Refresh token expirado
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar dados de entrada
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          error: 'Dados inválidos',
          message: 'Refresh token é obrigatório'
        });
        return;
      }

      // Renovar token
      const authResponse = await this.authUseCases.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Token renovado com sucesso',
        ...authResponse
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('inválido') || errorMessage.includes('expirado')) {
        res.status(401).json({
          error: 'Token inválido',
          message: errorMessage
        });
      } else {
        res.status(500).json({
          error: 'Erro interno',
          message: errorMessage
        });
      }
    }
  };

  /**
   * @swagger
   * /auth/logout:
   *   post:
   *     summary: Fazer logout da aplicação
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Logout realizado com sucesso
   *       401:
   *         description: Token inválido
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          error: 'Token requerido',
          message: 'Token de acesso é necessário para logout'
        });
        return;
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

      await this.authUseCases.logout(token);

      res.status(200).json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      res.status(401).json({
        error: 'Token inválido',
        message: errorMessage
      });
    }
  };

  /**
   * @swagger
   * /auth/me:
   *   get:
   *     summary: Obter informações do usuário logado
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Informações do usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: number
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *                     is_superuser:
   *                       type: boolean
   *       401:
   *         description: Não autenticado
   */
  me = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Não autenticado',
          message: 'Token de acesso requerido'
        });
        return;
      }

      res.status(200).json({
        user: req.user
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erro interno',
        message: 'Erro ao obter informações do usuário'
      });
    }
  };
}