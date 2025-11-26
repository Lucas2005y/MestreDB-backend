import Joi from 'joi';

/**
 * Schema de validação para variáveis de ambiente
 */
const envSchema = Joi.object({
  // Ambiente
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Ambiente de execução'),

  // Servidor
  PORT: Joi.number()
    .port()
    .default(3000)
    .description('Porta do servidor HTTP'),

  // MySQL
  MYSQL_HOST: Joi.string()
    .required()
    .description('Host do MySQL'),

  MYSQL_PORT: Joi.number()
    .port()
    .default(3306)
    .description('Porta do MySQL'),

  MYSQL_USERNAME: Joi.string()
    .required()
    .description('Usuário do MySQL'),

  MYSQL_PASSWORD: Joi.string()
    .allow('')
    .required()
    .description('Senha do MySQL'),

  MYSQL_DATABASE: Joi.string()
    .required()
    .description('Nome do banco de dados'),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret para assinatura de tokens JWT (mínimo 32 caracteres)'),

  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('1h')
    .description('Tempo de expiração do access token (ex: 1h, 30m, 7d)'),

  REFRESH_TOKEN_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('7d')
    .description('Tempo de expiração do refresh token (ex: 7d, 30d)'),

  // CORS
  CORS_ORIGIN: Joi.string()
    .required()
    .description('Origem permitida para CORS (ex: http://localhost:3000)'),

  // Rate Limiting
  RATE_LIMIT_MAX_ATTEMPTS: Joi.number()
    .integer()
    .min(1)
    .default(5)
    .description('Número máximo de tentativas de login'),

  RATE_LIMIT_WINDOW_MINUTES: Joi.number()
    .integer()
    .min(1)
    .default(15)
    .description('Janela de tempo para rate limiting (minutos)'),

  RATE_LIMIT_BLOCK_MINUTES: Joi.number()
    .integer()
    .min(1)
    .default(15)
    .description('Tempo de bloqueio após exceder limite (minutos)'),

  // Admin padrão
  ADMIN_EMAIL: Joi.string()
    .email()
    .default('admin@mestredb.com')
    .description('Email do administrador padrão'),

  ADMIN_PASSWORD: Joi.string()
    .min(8)
    .default('MinhaSenh@123')
    .description('Senha do administrador padrão (mínimo 8 caracteres)'),
})
  .unknown(true) // Permite outras variáveis não especificadas
  .messages({
    'any.required': '{{#label}} é obrigatória',
    'string.min': '{{#label}} deve ter no mínimo {{#limit}} caracteres',
    'string.pattern.base': '{{#label}} está em formato inválido',
    'number.port': '{{#label}} deve ser uma porta válida (1-65535)',
  });

/**
 * Interface tipada das variáveis de ambiente validadas
 */
export interface ValidatedEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MYSQL_HOST: string;
  MYSQL_PORT: number;
  MYSQL_USERNAME: string;
  MYSQL_PASSWORD: string;
  MYSQL_DATABASE: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_MAX_ATTEMPTS: number;
  RATE_LIMIT_WINDOW_MINUTES: number;
  RATE_LIMIT_BLOCK_MINUTES: number;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

/**
 * Valida as variáveis de ambiente no startup da aplicação
 * @throws Error se alguma variável obrigatória estiver faltando ou inválida
 */
export function validateEnv(): ValidatedEnv {
  console.log('🔍 Validando variáveis de ambiente...');

  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false, // Retorna todos os erros, não apenas o primeiro
    stripUnknown: false, // Mantém variáveis não especificadas
  });

  if (error) {
    const errorMessages = error.details.map((detail) => {
      return `  ❌ ${detail.message}`;
    });

    console.error('❌ Erro na validação de variáveis de ambiente:\n');
    console.error(errorMessages.join('\n'));
    console.error('\n💡 Verifique seu arquivo .env e corrija os erros acima.\n');

    throw new Error(`Configuração inválida: ${error.message}`);
  }

  // Validações customizadas adicionais
  validateCustomRules(value);

  console.log('✅ Variáveis de ambiente validadas com sucesso');
  console.log(`   📊 Ambiente: ${value.NODE_ENV}`);
  console.log(`   🔌 Porta: ${value.PORT}`);
  console.log(`   🗄️  Banco: ${value.MYSQL_DATABASE}@${value.MYSQL_HOST}:${value.MYSQL_PORT}`);
  console.log(`   🔐 JWT Secret: ${value.JWT_SECRET.substring(0, 8)}... (${value.JWT_SECRET.length} caracteres)`);
  console.log(`   ⏱️  Access Token: ${value.JWT_EXPIRES_IN}`);
  console.log(`   🔄 Refresh Token: ${value.REFRESH_TOKEN_EXPIRES_IN}`);
  console.log(`   🌐 CORS Origin: ${value.CORS_ORIGIN}`);

  return value as ValidatedEnv;
}

/**
 * Validações customizadas adicionais
 */
function validateCustomRules(env: any): void {
  // Validar que JWT_SECRET não seja o valor padrão em produção
  if (env.NODE_ENV === 'production') {
    const defaultSecrets = [
      'mestredb-secret-key-2024',
      'your-secret-key-here',
      'change-me',
    ];

    if (defaultSecrets.includes(env.JWT_SECRET)) {
      throw new Error(
        '❌ ERRO CRÍTICO: JWT_SECRET não pode usar valor padrão em produção! ' +
        'Defina um secret forte e único.'
      );
    }

    // Validar senha do admin em produção
    const weakPasswords = ['admin123', 'MinhaSenh@123', '12345678'];
    if (weakPasswords.includes(env.ADMIN_PASSWORD)) {
      console.warn(
        '⚠️  AVISO: ADMIN_PASSWORD está usando senha fraca em produção! ' +
        'Altere para uma senha forte após o primeiro login.'
      );
    }

    // Validar CORS em produção
    if (env.CORS_ORIGIN.includes('localhost')) {
      console.warn(
        '⚠️  AVISO: CORS_ORIGIN está configurado para localhost em produção! ' +
        'Defina o domínio real da aplicação.'
      );
    }
  }

  // Validar que JWT_EXPIRES_IN seja menor que REFRESH_TOKEN_EXPIRES_IN
  const accessTokenMs = parseTimeToMs(env.JWT_EXPIRES_IN);
  const refreshTokenMs = parseTimeToMs(env.REFRESH_TOKEN_EXPIRES_IN);

  if (accessTokenMs >= refreshTokenMs) {
    throw new Error(
      '❌ JWT_EXPIRES_IN deve ser menor que REFRESH_TOKEN_EXPIRES_IN'
    );
  }
}

/**
 * Converte string de tempo (ex: "1h", "30m") para milissegundos
 */
function parseTimeToMs(timeStr: string): number {
  const match = timeStr.match(/^(\d+)([smhd])$/);
  if (!match) return 0;

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

/**
 * Retorna uma descrição amigável de todas as variáveis de ambiente necessárias
 */
export function getEnvDocumentation(): string {
  return `
📋 Variáveis de Ambiente Necessárias:

🌍 AMBIENTE
  NODE_ENV              Ambiente de execução (development, production, test)
  PORT                  Porta do servidor HTTP (padrão: 3000)

🗄️  MYSQL
  MYSQL_HOST            Host do MySQL (obrigatório)
  MYSQL_PORT            Porta do MySQL (padrão: 3306)
  MYSQL_USERNAME        Usuário do MySQL (obrigatório)
  MYSQL_PASSWORD        Senha do MySQL (obrigatório)
  MYSQL_DATABASE        Nome do banco de dados (obrigatório)

🔐 JWT
  JWT_SECRET            Secret para JWT - mínimo 32 caracteres (obrigatório)
  JWT_EXPIRES_IN        Expiração do access token (padrão: 1h)
  REFRESH_TOKEN_EXPIRES_IN  Expiração do refresh token (padrão: 7d)

🌐 CORS
  CORS_ORIGIN           Origem permitida para CORS (obrigatório)

⚡ RATE LIMITING
  RATE_LIMIT_MAX_ATTEMPTS      Máximo de tentativas (padrão: 5)
  RATE_LIMIT_WINDOW_MINUTES    Janela de tempo em minutos (padrão: 15)
  RATE_LIMIT_BLOCK_MINUTES     Tempo de bloqueio em minutos (padrão: 15)

👤 ADMIN PADRÃO
  ADMIN_EMAIL           Email do admin (padrão: admin@mestredb.com)
  ADMIN_PASSWORD        Senha do admin (padrão: MinhaSenh@123)

💡 Dica: Copie .env.example para .env e ajuste os valores.
`;
}
