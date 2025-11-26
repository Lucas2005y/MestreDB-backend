# ⚙️ Configurações de Aplicações Externas

## 📋 Visão Geral

Configurações para integrar o MestreDB Backend com ferramentas externas.

**Baseado em:** [CleanArchitectureGuide/04-Configuracoes-Aplicacoes-Externas.md](../../CleanArchitectureGuide/04-Configuracoes-Aplicacoes-Externas.md)

---

## 🐳 Docker

### docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mestredb_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mestredb_sql
      MYSQL_USER: mestredb_user
      MYSQL_PASSWORD: mestredb_pass
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    command: --default-authentication-plugin=mysql_native_password
    networks:
      - mestredb_network

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: mestredb_phpmyadmin
    restart: always
    environment:
      PMA_HOST: mysql
      PMA_PORT: 3306
      PMA_USER: root
      PMA_PASSWORD: root
    ports:
      - "8080:80"
    depends_on:
      - mysql
    networks:
      - mestredb_network

volumes:
  mysql_data:

networks:
  mestredb_network:
    driver: bridge
```

### Comandos Docker

```bash
# Iniciar serviços
npm run docker:up

# Parar serviços
npm run docker:down

# Ver logs
npm run docker:logs

# Acessar MySQL
docker exec -it mestredb_mysql mysql -u root -p

# Acessar phpMyAdmin
# http://localhost:8080
```

---

## 📮 Postman

### Importar Collection

1. Abra Postman
2. File > Import
3. Selecione `MestreDB-API.postman_collection.json`
4. Collection importada!

### Configurar Variáveis

Crie um Environment com:

```json
{
  "base_url": "http://localhost:3000/api",
  "token": "",
  "refresh_token": ""
}
```

### Usar Collection

1. Faça login em `Auth > Login`
2. Token é salvo automaticamente
3. Use outros endpoints

---

## 📊 Swagger/OpenAPI

### Acessar Documentação

**URL:** http://localhost:3000/api-docs

### Configuração

```typescript
// src/infrastructure/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MestreDB API',
      version: '1.0.0',
      description: 'API REST para gestão de usuários',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/presentation/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
```

---

## 🔧 VS Code

### Extensões Recomendadas

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "rangav.vscode-thunder-client",
    "cweijan.vscode-mysql-client2"
  ]
}
```

### Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/src/index.ts"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## 🧪 Thunder Client (VS Code)

### Configuração

1. Instalar extensão Thunder Client
2. Importar collection de `thunder-client/`
3. Configurar environment

### Environment

```json
{
  "name": "Development",
  "variables": [
    {
      "name": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "name": "token",
      "value": ""
    }
  ]
}
```

---

## 📊 Monitoramento

### PM2 (Produção)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start dist/index.js --name mestredb-backend

# Ver status
pm2 status

# Ver logs
pm2 logs mestredb-backend

# Monitorar
pm2 monit

# Reiniciar
pm2 restart mestredb-backend

# Parar
pm2 stop mestredb-backend
```

### PM2 Ecosystem

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'mestredb-backend',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

---

## 🔍 Logs

### Winston (Recomendado)

```bash
npm install winston
```

```typescript
// src/shared/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

---

## 📚 Referências

- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)
- [Production Readiness](./PRODUCTION_READINESS.md)
