import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

/**
 * Níveis de log customizados
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Cores para cada nível (console)
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

/**
 * Determina o nível de log baseado no ambiente
 */
const level = (): string => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

/**
 * Formato para logs em arquivo (JSON)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Formato para logs no console (legível)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    let msg = `${timestamp} [${level}]: ${message}`;

    // Adiciona metadados se existirem
    if (Object.keys(meta).length > 0) {
      // Remove campos internos do winston
      const { stack, ...cleanMeta } = meta;
      if (Object.keys(cleanMeta).length > 0) {
        msg += ` ${JSON.stringify(cleanMeta)}`;
      }
      // Adiciona stack trace se existir
      if (stack) {
        msg += `\n${stack}`;
      }
    }

    return msg;
  })
);

/**
 * Transports para arquivos com rotação diária
 */
const fileTransports = [
  // Logs de erro
  new DailyRotateFile({
    filename: path.join('logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d', // Mantém logs por 14 dias
    zippedArchive: true,
  }),

  // Logs combinados (todos os níveis)
  new DailyRotateFile({
    filename: path.join('logs', 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }),

  // Logs de HTTP (requests)
  new DailyRotateFile({
    filename: path.join('logs', 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '7d', // HTTP logs por 7 dias
    zippedArchive: true,
  }),
];

/**
 * Transport para console (apenas em desenvolvimento)
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

/**
 * Cria o logger principal
 */
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    ...fileTransports,
    // Console apenas em desenvolvimento e test
    ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : []),
  ],
  // Não sair do processo em caso de erro no logger
  exitOnError: false,
});

/**
 * Stream para integração com Morgan (HTTP logging)
 */
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

/**
 * Helper para log de requisições HTTP
 */
export const logRequest = (req: any, res: any, responseTime: number) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });
};

/**
 * Helper para log de erros com contexto
 */
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
};

/**
 * Helper para log de auditoria
 */
export const logAudit = (action: string, userId: number, details?: Record<string, any>) => {
  logger.info('Audit Log', {
    type: 'audit',
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Helper para log de performance
 */
export const logPerformance = (operation: string, duration: number, metadata?: Record<string, any>) => {
  logger.debug('Performance', {
    type: 'performance',
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

/**
 * Cria um logger filho com contexto específico
 */
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

// Log de inicialização do sistema de logs
logger.info('Sistema de logs inicializado', {
  level: level(),
  environment: process.env.NODE_ENV || 'development',
  logsDirectory: path.resolve('logs'),
});

export default logger;
