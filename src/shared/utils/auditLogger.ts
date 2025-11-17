import { Request } from 'express';

// Extensão da interface Request para incluir informações do usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        id: number;
        name: string;
        email: string;
        is_superuser: boolean;
      };
    }
  }
}

export interface AuditLogEntry {
  timestamp: Date;
  userId: number;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string | number;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

export class AuditLogger {
  private static logs: AuditLogEntry[] = [];

  static log(req: Request, action: string, resource: string, resourceId?: string | number, success: boolean = true, details?: any): void {
    const logEntry: AuditLogEntry = {
      timestamp: new Date(),
      userId: req.user?.userId || 0,
      userEmail: req.user?.email || 'anonymous',
      action,
      resource,
      resourceId,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success,
      details
    };

    this.logs.push(logEntry);

    // Log no console para desenvolvimento
    console.log(`🔍 AUDIT LOG: ${logEntry.userEmail} ${action} ${resource}${resourceId ? ` (ID: ${resourceId})` : ''} - ${success ? 'SUCCESS' : 'FAILED'}`);

    // Em produção, você pode enviar para um serviço de logging externo
    // como Winston, Elasticsearch, etc.
  }

  static getLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }

  static getLogsByUser(userId: number, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  static getLogsByAction(action: string, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.action === action)
      .slice(-limit);
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

// Middleware para logging automático de operações sensíveis
export const auditMiddleware = (action: string, resource: string) => {
  return (req: Request, res: any, next: any) => {
    const originalSend = res.send;

    res.send = function(data: any) {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const resourceId = req.params.id || req.body.id;

      AuditLogger.log(req, action, resource, resourceId, success, {
        statusCode: res.statusCode,
        method: req.method,
        url: req.originalUrl
      });

      return originalSend.call(this, data);
    };

    next();
  };
};