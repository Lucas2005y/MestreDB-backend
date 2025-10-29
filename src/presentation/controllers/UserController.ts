import { Request, Response } from 'express';
import { UserUseCases } from '../../application/usecases/UserUseCases';
import { CreateUserDTO, UpdateUserDTO, UpdateOwnProfileDTO, UserResponseDTO } from '../../application/dtos/UserDTO';
import { User } from '../../domain/entities/User';
import { AuditLogger } from '../../shared/utils/auditLogger';

// Extensão da interface Request para incluir informações do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        is_superuser: boolean;
        id: number;
      };
    }
  }
}

export class UserController {
  private userUseCases: UserUseCases;

  constructor(userUseCases: UserUseCases) {
    this.userUseCases = userUseCases;
  }

  // Método para remover senha de um usuário (aceita User ou UserResponseDTO)
  private removePassword(user: User): Omit<User, 'password'>;
  private removePassword(user: UserResponseDTO): UserResponseDTO;
  private removePassword(user: User | UserResponseDTO): Omit<User, 'password'> | UserResponseDTO {
    if ('password' in user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return user; // UserResponseDTO já não tem password
  }

  // Método para remover senhas de uma lista de usuários
  private removePasswordsFromList(users: User[]): Omit<User, 'password'>[];
  private removePasswordsFromList(users: UserResponseDTO[]): UserResponseDTO[];
  private removePasswordsFromList(users: User[] | UserResponseDTO[]): Omit<User, 'password'>[] | UserResponseDTO[] {
    if (users.length === 0) return users;
    
    // Se o primeiro item tem password, então são Users
    if ('password' in users[0]) {
      return (users as User[]).map(user => this.removePassword(user) as Omit<User, 'password'>);
    } else {
      // Se não tem password, então são UserResponseDTO
      return users as UserResponseDTO[];
    }
  }

  /**
   * @swagger
   * /usuarios:
   *   post:
   *     summary: Criar novo usuário
   *     tags: [Usuários]
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
   *                 example: "João Silva"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "joao@email.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: "senha123"
   *               is_superuser:
   *                 type: boolean
   *                 default: false
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
   *       400:
   *         description: Dados inválidos
   *       409:
   *         description: Email já está em uso
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userUseCases.createUser(userData);
      
      // Log de auditoria para criação de usuário
      AuditLogger.log(req, 'CREATE_USER', 'USER', user.id, true, {
        createdUserId: user.id,
        createdUserEmail: user.email,
        adminUserId: req.user?.id
      });
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('Email já está em uso')) {
        res.status(409).json({
          success: false,
          message: errorMessage
        });
      } else if (errorMessage.includes('Dados inválidos')) {
        res.status(400).json({
          success: false,
          message: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * @swagger
   * /usuarios:
   *   get:
   *     summary: Listar usuários com paginação
   *     tags: [Usuários]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Quantidade de itens por página
   *     responses:
   *       200:
   *         description: Lista de usuários
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.userUseCases.getAllUsers(page, limit);
      
      // Filtrar senhas dos usuários (super usuários não devem ver senhas)
      const usersWithoutPasswords = this.removePasswordsFromList(result.users);
      
      res.status(200).json({
        success: true,
        message: 'Usuários listados com sucesso',
        data: {
          users: usersWithoutPasswords,
          total: result.total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /usuarios/me:
   *   get:
   *     summary: Obter perfil do usuário logado
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil do usuário
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
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
   *                     created_at:
   *                       type: string
   *                     updated_at:
   *                       type: string
   *       401:
   *         description: Não autenticado
   */
  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const user = await this.userUseCases.getUserById(req.user.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: user // UserResponseDTO já não tem senha
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * @swagger
   * /usuarios/me:
   *   put:
   *     summary: Atualizar perfil do usuário logado
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "João Silva Santos"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "joao.santos@email.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: "novaSenha123"
   *     responses:
   *       200:
   *         description: Perfil atualizado com sucesso
   *       400:
   *         description: Dados inválidos
   *       401:
   *         description: Não autenticado
   *       409:
   *         description: Email já está em uso
   */
  async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Usuário não pode alterar is_superuser no próprio perfil
      if (req.body.is_superuser !== undefined) {
        res.status(403).json({
          success: false,
          message: 'Você não pode alterar seu nível de privilégio'
        });
        return;
      }

      const updateData: UpdateOwnProfileDTO = req.body;
      const updatedUser = await this.userUseCases.updateOwnProfile(req.user.userId, updateData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updatedUser // UserResponseDTO já não tem senha
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('Email já está em uso')) {
        res.status(409).json({
          success: false,
          message: errorMessage
        });
      } else if (errorMessage.includes('inválido')) {
        res.status(400).json({
          success: false,
          message: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * @swagger
   * /usuarios/{id}:
   *   get:
   *     summary: Buscar usuário por ID
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Usuário encontrado
   *       404:
   *         description: Usuário não encontrado
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const user = await this.userUseCases.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar se deve filtrar senha
      res.status(200).json({
        success: true,
        message: 'Usuário encontrado',
        data: user // UserResponseDTO já não tem senha
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('ID inválido')) {
        res.status(400).json({
          success: false,
          message: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * @swagger
   * /usuarios/{id}:
   *   put:
   *     summary: Atualizar usuário
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "João Silva Santos"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "joao.santos@email.com"
   *               password:
   *                 type: string
   *                 minLength: 6
   *                 example: "novaSenha123"
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
   *       400:
   *         description: Dados inválidos
   *       404:
   *         description: Usuário não encontrado
   *       409:
   *         description: Email já está em uso
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const userData: UpdateUserDTO = req.body;
      const user = await this.userUseCases.updateUser(id, userData);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('Email já está em uso')) {
        res.status(409).json({
          success: false,
          message: errorMessage
        });
      } else if (errorMessage.includes('Dados inválidos') || errorMessage.includes('ID inválido')) {
        res.status(400).json({
          success: false,
          message: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }

  /**
   * @swagger
   * /usuarios/{id}:
   *   delete:
   *     summary: Excluir usuário
   *     tags: [Usuários]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID do usuário
   *     responses:
   *       200:
   *         description: Usuário excluído com sucesso
   *       400:
   *         description: ID inválido
   *       404:
   *         description: Usuário não encontrado
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const deleted = await this.userUseCases.deleteUser(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Log de auditoria para exclusão de usuário
      AuditLogger.log(req, 'DELETE_USER', 'USER', id, true, {
        deletedUserId: id,
        adminUserId: req.user?.id
      });

      res.status(200).json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
      
      if (errorMessage.includes('ID inválido')) {
        res.status(400).json({
          success: false,
          message: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }
}