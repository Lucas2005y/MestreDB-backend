import { Request, Response, NextFunction } from 'express';
import { logError } from '../../shared/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log estruturado do erro
  logError(error, {
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Resposta para o cliente
  const response: any = {
    success: false,
    message: error.message || 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    path: req.url
  };

  // Em desenvolvimento, incluir stack trace
  if (!isProduction && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.url} não encontrada`,
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};