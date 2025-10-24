import { Request, Response, NextFunction } from 'express';
import { AuthUseCases, TokenPayload } from '../../application/usecases/AuthUseCases';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';

// Estender a interface Request para incluir informações do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        is_superuser: boolean;
      };
    }
  }
}

// Instância dos use cases para autenticação
const userRepository = new UserRepository();
const authUseCases = new AuthUseCases(userRepository);

// Middleware para verificar se o usuário está autenticado
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Token de acesso requerido',
        message: 'Você precisa estar logado para acessar este recurso'
      });
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      res.status(401).json({
        error: 'Token inválido',
        message: 'Formato do token deve ser: Bearer <token>'
      });
      return;
    }

    // Validar token
    const decoded = await authUseCases.validateToken(token);

    // Adicionar informações do usuário ao request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      is_superuser: decoded.is_superuser
    };

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro de autenticação';
    
    res.status(401).json({
      error: 'Token inválido',
      message: errorMessage
    });
  }
};

// Middleware opcional - permite acesso sem autenticação, mas adiciona user se autenticado
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

      if (token) {
        try {
          const decoded = await authUseCases.validateToken(token);
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            is_superuser: decoded.is_superuser
          };
        } catch (error) {
          // Ignora erros de token em auth opcional
        }
      }
    }

    next();
  } catch (error) {
    // Em auth opcional, sempre continua mesmo com erro
    next();
  }
};