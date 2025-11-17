# 🚀 Guia de Preparação para Produção - MestreDB Backend

## 📋 Visão Geral

Este documento detalha todas as melhorias necessárias para preparar o MestreDB Backend para ambiente de produção. O projeto possui uma excelente base arquitetural (Clean Architecture), mas requer ajustes críticos de configuração, segurança e operação.

**Status Atual:** 80% pronto para produção
**Tempo Estimado:** 2-3 semanas de trabalho

---

## 🎯 Análise Atual

### ✅ Pontos Fortes

**Arquitetura:**
- ✅ Clean Architecture bem implementada
- ✅ Factory Pattern aplicado corretamente
- ✅ Dependency Injection configurado
- ✅ Repository Pattern implementado
- ✅ Estrutura de pastas organizada

**Segurança:**
- ✅ JWT com access e refresh tokens
- ✅ bcrypt para senhas (12 salt rounds)
- ✅ Rate limiting implementado
- ✅ CORS configurável
- ✅ Validação com class-validator
- ✅ Token blacklist

**Testes:**
- ✅ Jest configurado
- ✅ Testes unitários e integração
- ✅ SQLite em memória para testes
- ✅ Coverage configurado

**DevOps:**
- ✅ Docker Compose
- ✅ Scripts npm organizados
- ✅ TypeScript configurado
- ✅ Graceful shutdown

### ⚠️ Problemas Críticos

1. **Configuração de ambientes inconsistente**
2. **Variáveis de ambiente com valores incorretos**
3. **Falta validação de variáveis obrigatórias**
4. **Secrets hardcoded com valores fracos**
5. **Logs de senha em produção**
6. **Sincronização automática do banco**

---

## 🔴 Prioridade URGENTE (Antes de Produção)

### ✅ 1. Corrigir .env.example - CONCLUÍDO

**Problema:** Valores inconsistentes com configuração real

**Arquivo:** `.env.example`

**Status:** ✅ **CONCLUÍDO**

**Correções aplicadas:**
- ✅ Porta MySQL corrigida para 3307 (Docker)
- ✅ Variável JWT corrigida para `JWT_EXPIRES_IN`
- ✅ Duração do token corrigida para 1h
- ✅ Senha do admin atualizada para `MinhaSenh@123`
- ✅ Senha do MySQL atualizada para `root`
- ✅ Removida referência ao MongoDB (não usado)
- ✅ Adicionados comentários explicativos
- ✅ Adicionadas notas importantes para produção

**Arquivo atualizado:** `.env.example` está agora consistente com a configuração real do projeto.

---

### 2. Criar Configuração por Ambiente

**Problema:** Não há separação entre dev/test/prod

**Solução:** Criar arquivos específicos

**Estrutura:**
```
.env.development    # Desenvolvimento local
.env.test          # Testes automatizados
.env.production    # Produção (não commitar!)
.env.example       # Template
```

**Implementação:**

```typescript
// src/infrastructure/config/environment.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

export function loadEnvironment(): void {
  const env = process.env.NODE_ENV || 'development';
  const envFile = `.env.${env}`;

  // Tentar carregar arquivo específico do ambiente
  const result = dotenv.config({
    path: path.resolve(process.cwd(), envFile)
  });

  // Fallback para .env genérico
  if (result.error) {
    dotenv.config();
  }

  console.log(`📝 Ambiente carregado: ${env}`);
}
```

**Atualizar bootstrap:**

```typescript
// src/main/bootstrap.ts
import { loadEnvironment } from '../infrastructure/config/environment';
import { validateEnvironment } from '../infrastructure/config/validateEnv';

export async function bootstrap(): Promise<void> {
  // 1. Carregar variáveis de ambiente
  loadEnvironment();

  // 2. Validar variáveis obrigatórias
  validateEnvironment();

  // 3. Configurar DI Container
  // ... resto do código
}
```

---

### 3. Implementar Validação de Variáveis

**Problema:** Aplicação pode iniciar com configuração inválida

**Solução:** Validar no startup

**Criar arquivo:**

```typescript
// src/infrastructure/config/validateEnv.ts
import * as Joi from 'joi';

const envSchema = Joi.object({
  // Servidor
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .required(),
  PORT: Joi.number()
    .default(3000),

  // MySQL
  MYSQL_HOST: Joi.string()
    .required(),
  MYSQL_PORT: Joi.number()
    .required(),
  MYSQL_USERNAME: Joi.string()
    .required(),
  MYSQL_PASSWORD: Joi.string()
    .required(),
  MYSQL_DATABASE: Joi.string()
    .required(),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_SECRET deve ter pelo menos 32 caracteres',
      'any.required': 'JWT_SECRET é obrigatório'
    }),
  JWT_EXPIRES_IN: Joi.string()
    .required(),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string()
    .required(),

  // CORS
  CORS_ORIGIN: Joi.string()
    .required(),

  // Admin
  ADMIN_EMAIL: Joi.string()
    .email()
    .required(),
  ADMIN_PASSWORD: Joi.string()
    .min(8)
    .required(),

  // Rate Limiting
  RATE_LIMIT_MAX_ATTEMPTS: Joi.number()
    .default(5),
  RATE_LIMIT_WINDOW_MINUTES: Joi.number()
    .default(15),
  RATE_LIMIT_BLOCK_MINUTES: Joi.number()
    .default(15),
}).unknown(); // Permitir outras variáveis

export function validateEnvironment(): void {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false, // Mostrar todos os erros
  });

  if (error) {
    const errors = error.details.map(detail => detail.message).join('\n');
    throw new Error(`❌ Configuração inválida:\n${errors}`);
  }

  // Validações específicas para produção
  if (process.env.NODE_ENV === 'production') {
    validateProductionConfig();
  }

  console.log('✅ Variáveis de ambiente validadas');
}

function validateProductionConfig(): void {
  const errors: string[] = [];

  // JWT_SECRET deve ser forte em produção
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 64) {
    errors.push('JWT_SECRET deve ter pelo menos 64 caracteres em produção');
  }

  // Não usar senhas padrão
  const weakPasswords = ['admin123', 'password', '123456'];
  if (process.env.ADMIN_PASSWORD &&
      weakPasswords.includes(process.env.ADMIN_PASSWORD.toLowerCase())) {
    errors.push('ADMIN_PASSWORD não pode ser uma senha fraca em produção');
  }

  // CORS não pode ser *
  if (process.env.CORS_ORIGIN === '*') {
    errors.push('CORS_ORIGIN não pode ser * em produção');
  }

  if (errors.length > 0) {
    throw new Error(`❌ Configuração de produção inválida:\n${errors.join('\n')}`);
  }
}
```

---

### 4. Remover Logs de Senha

**Problema:** Senha do admin é logada no console

**Arquivo:** `src/infrastructure/config/DatabaseInitializer.ts`

**Antes:**
```typescript
console.log('✅ Usuário administrador padrão criado');
console.log(`📧 Email: ${adminEmail}`);
console.log(`🔑 Senha: ${adminPassword}`); // ❌ NUNCA LOGAR SENHA
```

**Depois:**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('✅ Usuário administrador padrão criado');
  console.log(`📧 Email: ${adminEmail}`);
  console.log('🔑 Use a senha configurada em ADMIN_PASSWORD');
} else {
  console.log('✅ Usuário administrador verificado');
}
```

---

### 5. Desabilitar Sincronização Automática

**Problema:** `synchronize: true` é perigoso em produção

**Arquivo:** `src/infrastructure/config/database.ts`

**Antes:**
```typescript
synchronize: process.env.NODE_ENV !== 'production',
```

**Depois:**
```typescript
synchronize: false, // SEMPRE false - usar migrations
migrations: [
  process.env.NODE_ENV === 'production'
    ? 'dist/infrastructure/database/migrations/*.js'
    : 'src/infrastructure/database/migrations/*.ts'
],
migrationsRun: process.env.NODE_ENV === 'production',
```

**Criar migration inicial:**
```bash
npm run migration:generate -- CreateUsersTable
```

---

### 6. Fortalecer Secrets

**Problema:** Valores padrão fracos

**Arquivo:** `src/application/services/TokenService.ts`

**Antes:**
```typescript
this.JWT_SECRET = process.env.JWT_SECRET || 'mestredb-secret-key-2024';
```

**Depois:**
```typescript
this.JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET é obrigatório em produção');
  }
  return 'dev-secret-key-only-for-development';
})();
```

---

## 🟡 Prioridade IMPORTANTE (Curto Prazo)

### 7. Implementar Logging Estruturado

**Problema:** `console.log` não é adequado para produção

**Solução:** Usar Winston

**Instalação:**
```bash
npm install winston
npm install --save-dev @types/winston
```

**Implementação:**

```typescript
// src/shared/utils/logger.ts
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'mestredb-backend',
    environment: process.env.NODE_ENV
  },
  transports: [
    // Erros em arquivo separado
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Todos os logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Console apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Exportar métodos convenientes
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};
```

**Uso:**
```typescript
// Substituir console.log por logger
import { log } from '../shared/utils/logger';

// Antes
console.log('✅ Conexão estabelecida');

// Depois
log.info('Conexão com banco estabelecida', {
  database: process.env.MYSQL_DATABASE
});
```

---

### 8. Melhorar Health Check

**Problema:** Health check muito simples

**Solução:** Verificar dependências

**Criar:**

```typescript
// src/presentation/controllers/HealthController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/config/database';

export class HealthController {
  async check(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: await this.checkDatabase(),
        memory: this.checkMemory(),
      },
      responseTime: 0,
    };

    health.responseTime = Date.now() - startTime;

    // Status 503 se algum check falhar
    const isHealthy = Object.values(health.checks)
      .every(check => check.status === 'up');

    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json(health);
  }

  private async checkDatabase(): Promise<any> {
    try {
      if (!AppDataSource.isInitialized) {
        return { status: 'down', message: 'Not initialized' };
      }

      await AppDataSource.query('SELECT 1');

      return {
        status: 'up',
        message: 'Connected',
        responseTime: 0 // Adicionar medição se necessário
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private checkMemory(): any {
    const usage = process.memoryUsage();
    const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const percentUsed = Math.round((usedMB / totalMB) * 100);

    return {
      status: percentUsed < 90 ? 'up' : 'warning',
      total: `${totalMB}MB`,
      used: `${usedMB}MB`,
      percentUsed: `${percentUsed}%`,
    };
  }
}
```

**Adicionar rota:**
```typescript
// src/presentation/routes/healthRoutes.ts
import { Router } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const healthController = new HealthController();

router.get('/health', (req, res) => healthController.check(req, res));
router.get('/health/live', (req, res) => res.json({ status: 'alive' }));
router.get('/health/ready', (req, res) => healthController.check(req, res));

export default router;
```

---

### 9. Adicionar CI/CD Pipeline

**Problema:** Sem automação de testes e deploy

**Solução:** GitHub Actions

**Criar:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: mestredb_test
        ports:
          - 3307:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          MYSQL_HOST: localhost
          MYSQL_PORT: 3307
          MYSQL_USERNAME: root
          MYSQL_PASSWORD: root
          MYSQL_DATABASE: mestredb_test
          JWT_SECRET: test-secret-key-for-ci-pipeline-only

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t mestredb-backend:latest .
```

---

### 10. Documentar Processo de Deploy

**Criar:**

```markdown
# docs/DEPLOYMENT.md
# Guia de Deploy - MestreDB Backend

## Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Nginx (para proxy reverso)
- SSL/TLS certificado

## Checklist Pré-Deploy

### Configuração
- [ ] Criar `.env.production` com valores reais
- [ ] JWT_SECRET com 64+ caracteres aleatórios
- [ ] Senha do admin forte e única
- [ ] CORS_ORIGIN com domínio real
- [ ] Configurar backup automático do banco

### Segurança
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] SSL/TLS configurado
- [ ] Rate limiting testado
- [ ] Logs de auditoria habilitados
- [ ] Secrets não commitados no git

### Banco de Dados
- [ ] Migrations executadas
- [ ] Backup inicial criado
- [ ] Usuário do banco com permissões mínimas
- [ ] `synchronize: false` confirmado

### Aplicação
- [ ] Build de produção testado
- [ ] Health checks funcionando
- [ ] Graceful shutdown testado
- [ ] Logs estruturados configurados
- [ ] Monitoramento configurado

## Passos de Deploy

### 1. Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Instalar MySQL
sudo apt install -y mysql-server
```

### 2. Configurar Banco de Dados

```bash
# Criar banco e usuário
sudo mysql -u root -p

CREATE DATABASE mestredb_sql;
CREATE USER 'mestredb_user'@'localhost' IDENTIFIED BY 'senha_forte_aqui';
GRANT ALL PRIVILEGES ON mestredb_sql.* TO 'mestredb_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Deploy da Aplicação

```bash
# Clonar repositório
git clone https://github.com/Lucas2005y/MestreDB-backend.git
cd MestreDB-backend

# Instalar dependências
npm ci --production

# Criar .env.production
cp .env.example .env.production
nano .env.production  # Editar com valores reais

# Build
npm run build

# Executar migrations
NODE_ENV=production npm run migration:run

# Iniciar com PM2
pm2 start dist/index.js --name mestredb-backend --env production
pm2 save
pm2 startup
```

### 4. Configurar Nginx

```nginx
# /etc/nginx/sites-available/mestredb
server {
    listen 80;
    server_name api.mestredb.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mestredb.com;

    # SSL
    ssl_certificate /etc/letsencrypt/live/api.mestredb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mestredb.com/privkey.pem;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/mestredb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.mestredb.com
```

### 6. Configurar Backup Automático

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-mestredb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/mestredb"
DATE=$(date +%Y%m%d_%H%M%S)
MYSQL_USER="mestredb_user"
MYSQL_PASS="senha_forte_aqui"
MYSQL_DB="mestredb_sql"

mkdir -p $BACKUP_DIR

# Backup do banco
mysqldump -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-mestredb.sh

# Agendar no cron (diariamente às 2h)
sudo crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/backup-mestredb.sh
```

### 7. Monitoramento

```bash
# Ver logs da aplicação
pm2 logs mestredb-backend

# Ver status
pm2 status

# Monitoramento em tempo real
pm2 monit

# Verificar health check
curl https://api.mestredb.com/health
```

## Rollback

```bash
# Parar aplicação
pm2 stop mestredb-backend

# Reverter para versão anterior
git checkout <commit-anterior>
npm ci --production
npm run build

# Reverter migrations se necessário
NODE_ENV=production npm run migration:revert

# Reiniciar
pm2 restart mestredb-backend
```

## Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
pm2 logs mestredb-backend --lines 100

# Verificar variáveis de ambiente
pm2 env 0

# Testar manualmente
NODE_ENV=production node dist/index.js
```

### Erro de conexão com banco
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u mestredb_user -p -h localhost mestredb_sql
```

### Erro 502 Bad Gateway
```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log
```
```

---

## 🟢 Prioridade DESEJÁVEL (Médio Prazo)

### 11. Testes E2E

**Criar estrutura:**

```
src/__tests__/
├── unit/              # Testes unitários
├── integration/       # Testes de integração
└── e2e/              # Testes end-to-end
    ├── auth.e2e.test.ts
    ├── users.e2e.test.ts
    └── setup.ts
```

### 12. APM e Error Tracking

**Opções:**
- Sentry para error tracking
- New Relic ou DataDog para APM
- Prometheus + Grafana para métricas

### 13. Métricas e Dashboards

**Implementar:**
- Tempo de resposta por endpoint
- Taxa de erro
- Uso de recursos
- Usuários ativos
- Tentativas de login

### 14. Backup Automatizado

**Implementar:**
- Backup diário do banco
- Retenção de 30 dias
- Backup em cloud (S3, Google Cloud Storage)
- Testes de restore mensais

### 15. Disaster Recovery Plan

**Documentar:**
- Procedimentos de restore
- Contatos de emergência
- SLA esperado
- Plano de comunicação

---

## 📊 Cronograma Sugerido

### Semana 1: Correções Urgentes
- ✅ Dia 1-2: ~~Corrigir .env.example~~ e criar configuração por ambiente
- Dia 3: Implementar validação de variáveis
- Dia 4: Remover logs de senha e fortalecer secrets
- Dia 5: Desabilitar sync e criar migrations

### Semana 2: Melhorias Importantes
- Dia 1-2: Implementar logging estruturado
- Dia 3: Melhorar health checks
- Dia 4: Configurar CI/CD
- Dia 5: Documentar deploy

### Semana 3: Preparação Final
- Dia 1-2: Testes em ambiente staging
- Dia 3: Configurar monitoramento
- Dia 4: Backup e disaster recovery
- Dia 5: Deploy em produção

---

## ✅ Checklist Final

### Antes do Deploy
- [ ] Todas as correções urgentes aplicadas
- [ ] Testes passando em CI/CD
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente validadas
- [ ] Migrations testadas
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] SSL/TLS configurado
- [ ] Health checks funcionando
- [ ] Rollback plan testado

### Pós-Deploy
- [ ] Verificar health checks
- [ ] Verificar logs
- [ ] Testar endpoints principais
- [ ] Verificar métricas
- [ ] Documentar issues encontrados
- [ ] Comunicar equipe

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs: `pm2 logs mestredb-backend`
2. Verificar health: `curl https://api.mestredb.com/health`
3. Consultar documentação
4. Abrir issue no GitHub

---

## 📚 Referências

- [Clean Architecture Guide](../CleanArchitectureGuide/)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Best Practices](https://www.nginx.com/blog/nginx-best-practices/)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

**Última atualização:** 2025-01-10
**Versão:** 1.0.0
