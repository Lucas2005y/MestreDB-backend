import { Request, Response, NextFunction } from 'express';
import { RateLimitingService } from '../../application/services/RateLimitingService';

// Estender interface Request para incluir informações de rate limiting
declare global {
  namespace Express {
    interface Request {
      rateLimitInfo?: {
        identifier: string;
        attemptsLeft?: number;
        isBlocked: boolean;
      };
    }
  }
}

export class CustomRateLimitMiddleware {
  private rateLimitingService: RateLimitingService;

  constructor(rateLimitingService: RateLimitingService) {
    this.rateLimitingService = rateLimitingService;
    console.log('🔧 CustomRateLimitMiddleware inicializado');
  }

  /**
   * Middleware para rate limiting de login
   */
  loginRateLimit = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Obter identificador único (IP + email se disponível)
      const ip = this.getClientIP(req);
      const email = req.body?.email || '';
      const identifier = email ? `${ip}:${email}` : ip;

      console.log(`🔍 Verificando rate limit para: ${identifier}`);

      // Verificar se pode fazer tentativa
      const result = this.rateLimitingService.canAttempt(identifier);

      // Adicionar informações ao request para uso posterior
      req.rateLimitInfo = {
        identifier,
        attemptsLeft: result.attemptsLeft,
        isBlocked: !result.allowed
      };

      // Adicionar headers informativos
      res.set({
        'X-RateLimit-Limit': this.rateLimitingService.getConfig().maxAttempts.toString(),
        'X-RateLimit-Remaining': (result.attemptsLeft || 0).toString(),
        'X-RateLimit-Reset': result.remainingTime ? 
          new Date(Date.now() + (result.remainingTime * 1000)).toISOString() : 
          new Date().toISOString()
      });

      if (!result.allowed) {
        console.log(`🚫 Rate limit excedido para ${identifier}. Bloqueado por ${result.remainingTime}s`);
        
        res.status(429).json({
          error: 'Muitas tentativas de login',
          message: `Tente novamente em ${result.remainingTime} segundos`,
          retryAfter: result.remainingTime,
          type: 'RATE_LIMIT_EXCEEDED'
        });
        return;
      }

      console.log(`✅ Rate limit OK para ${identifier}. Tentativas restantes: ${result.attemptsLeft}`);
      next();
    } catch (error) {
      console.error('❌ Erro no middleware de rate limiting:', error);
      // Em caso de erro, permitir a requisição para não quebrar o sistema
      next();
    }
  };

  /**
   * Middleware para registrar resultado da tentativa de login
   */
  recordLoginAttempt = (req: Request, res: Response, next: NextFunction): void => {
    // Interceptar a resposta para registrar o resultado
    const originalSend = res.send;
    const rateLimitingService = this.rateLimitingService; // Capturar referência
    
    res.send = function(body: any) {
      try {
        if (req.rateLimitInfo) {
          const { identifier } = req.rateLimitInfo;
          
          // Determinar se foi sucesso baseado no status code
          const success = res.statusCode >= 200 && res.statusCode < 300;
          
          // Registrar a tentativa
          rateLimitingService.recordAttempt(identifier, success);
          
          console.log(`📊 Tentativa registrada para ${identifier}: ${success ? 'SUCESSO' : 'FALHA'} (Status: ${res.statusCode})`);
        }
      } catch (error) {
        console.error('❌ Erro ao registrar tentativa de login:', error);
      }
      
      return originalSend.call(this, body);
    };

    next();
  };

  /**
   * Obtém o IP real do cliente considerando proxies
   */
  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIP = req.headers['x-real-ip'] as string;
    const remoteAddress = req.connection?.remoteAddress || req.socket?.remoteAddress;

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }

    return remoteAddress || 'unknown';
  }

  /**
   * Endpoint para verificar status de rate limiting (para debugging)
   */
  getStatus = (req: Request, res: Response): void => {
    try {
      const ip = this.getClientIP(req);
      const email = req.query.email as string;
      const identifier = email ? `${ip}:${email}` : ip;

      const stats = this.rateLimitingService.getStats(identifier);
      const canAttempt = this.rateLimitingService.canAttempt(identifier);
      const config = this.rateLimitingService.getConfig();

      res.json({
        identifier,
        config: {
          maxAttempts: config.maxAttempts,
          windowSeconds: config.windowMinutes * 60,
          blockSeconds: config.blockMinutes * 60
        },
        stats,
        canAttempt: canAttempt.allowed,
        attemptsLeft: canAttempt.attemptsLeft,
        remainingTime: canAttempt.remainingTime
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao obter status de rate limiting',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  /**
   * Endpoint para reset de rate limiting (apenas para testes)
   */
  reset = (req: Request, res: Response): void => {
    try {
      this.rateLimitingService.reset();
      res.json({
        message: 'Rate limiting resetado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Erro ao resetar rate limiting',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
}