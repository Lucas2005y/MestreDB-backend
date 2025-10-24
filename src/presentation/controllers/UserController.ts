import { Request, Response } from 'express';
import { UserUseCases } from '../../application/usecases/UserUseCases';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { CreateUserDTO, UpdateUserDTO } from '../../application/dtos/UserDTO';

export class UserController {
  private userUseCases: UserUseCases;

  constructor() {
    const userRepository = new UserRepository();
    this.userUseCases = new UserUseCases(userRepository);
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
      
      res.status(200).json({
        success: true,
        message: 'Usuários listados com sucesso',
        data: result
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

      res.status(200).json({
        success: true,
        message: 'Usuário encontrado',
        data: user
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