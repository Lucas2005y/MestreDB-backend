import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../../shared/utils/logger';

/**
 * Middleware para logging de requisições HTTP
 *
 * Registra:
 * - Método HTTP
 * - URL
 * - Status code
 * - Tempo de resposta
 * - IP do cliente
 * - User agent
 * - ID do usuário (se autenticado)
 */
export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Captura o evento de finalização da resposta
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logRequest(req, res, responseTime);
  });

  next();
};
