import rateLimit from 'express-rate-limit';

// Rate limiting para registro de usuários (mais restritivo)
export const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP a cada 15 minutos
  message: {
    error: 'Muitas tentativas de registro',
    message: 'Você excedeu o limite de tentativas de registro. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Pular rate limiting para usuários autenticados (admins criando usuários)
    return !!req.user;
  }
});

// Rate limiting para login (moderado)
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas por IP a cada 15 minutos
  message: {
    error: 'Muitas tentativas de login',
    message: 'Você excedeu o limite de tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting geral para API (mais permissivo)
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP a cada 15 minutos
  message: {
    error: 'Muitas requisições',
    message: 'Você excedeu o limite de requisições. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para health check
    return req.path === '/api/health';
  }
});

// Alias para compatibilidade
export const generalRateLimit = apiRateLimit;

// Rate limiting para operações sensíveis (muito restritivo)
export const sensitiveOperationsRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // máximo 20 operações sensíveis por IP a cada hora
  message: {
    error: 'Muitas operações sensíveis',
    message: 'Você excedeu o limite de operações sensíveis. Tente novamente em 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,
});