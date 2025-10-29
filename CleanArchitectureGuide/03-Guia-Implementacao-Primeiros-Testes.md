# Guia de Implementação para Primeiros Testes - MestreDB Backend

## 📋 Visão Geral

Este documento fornece um guia completo e passo a passo para configurar o ambiente de desenvolvimento do MestreDB Backend e executar os primeiros testes. Ideal para novos desenvolvedores ou para configuração em novos ambientes.

## 🔧 Pré-requisitos do Sistema

### Software Necessário

#### 1. Node.js (Versão 18 ou superior)
**Download:** https://nodejs.org/

**Verificação da instalação:**
```bash
node --version
npm --version
```

**Versões recomendadas:**
- Node.js: v18.17.0 ou superior
- npm: v9.6.7 ou superior

#### 2. Git
**Download:** https://git-scm.com/

**Verificação da instalação:**
```bash
git --version
```

#### 3. Docker e Docker Compose
**Download:** https://www.docker.com/get-started

**Verificação da instalação:**
```bash
docker --version
docker-compose --version
```

**Versões mínimas:**
- Docker: v20.10.0 ou superior
- Docker Compose: v2.0.0 ou superior

#### 4. Editor de Código (Recomendado)
- **Visual Studio Code** com extensões:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - REST Client

### Requisitos de Sistema

#### Windows
- Windows 10 versão 1903 ou superior
- WSL2 habilitado (para Docker)
- 8GB RAM mínimo (16GB recomendado)
- 10GB espaço livre em disco

#### macOS
- macOS 10.15 ou superior
- 8GB RAM mínimo (16GB recomendado)
- 10GB espaço livre em disco

#### Linux
- Ubuntu 18.04+ / CentOS 7+ / Debian 10+
- 8GB RAM mínimo (16GB recomendado)
- 10GB espaço livre em disco

## 🚀 Configuração do Ambiente

### Passo 1: Clonagem do Repositório

```bash
# Clone o repositório
git clone https://github.com/Lucas2005y/MestreDB-backend.git

# Navegue para o diretório
cd MestreDB-backend

# Verifique se está na branch correta
git branch
```

### Passo 2: Instalação das Dependências

```bash
# Instalar dependências do projeto
npm install

# Verificar se todas as dependências foram instaladas
npm list --depth=0
```

**Dependências principais que serão instaladas:**
- **express**: Framework web
- **typeorm**: ORM para TypeScript
- **mysql2**: Driver MySQL
- **bcrypt**: Criptografia de senhas
- **jsonwebtoken**: Autenticação JWT
- **class-validator**: Validação de dados
- **cors**: Configuração CORS
- **swagger-ui-express**: Documentação da API

### Passo 3: Configuração das Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env (use seu editor preferido)
# Windows:
notepad .env

# macOS/Linux:
nano .env
# ou
vim .env
```

**Configuração do arquivo .env:**
```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB (mantido para compatibilidade)
MONGODB_URI=mongodb://localhost:27017/mestredb
DATABASE_NAME=mestredb

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=admin123
MYSQL_DATABASE=mestredb_sql

# JWT - IMPORTANTE: Altere estes valores em produção!
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_com_pelo_menos_32_caracteres
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin padrão
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=admin123

# Rate Limiting - Proteção contra ataques de força bruta
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_BLOCK_MINUTES=15
```

**⚠️ Importante:** Para ambiente de produção, altere:
- `JWT_SECRET`: Use uma string aleatória de pelo menos 32 caracteres
- `ADMIN_PASSWORD`: Use uma senha forte
- `MYSQL_PASSWORD`: Use uma senha segura para o banco

### Passo 4: Configuração do Banco de Dados

#### Opção A: Usando Docker (Recomendado)

```bash
# Iniciar MySQL com Docker Compose
npm run docker:up

# Verificar se o container está rodando
docker ps

# Verificar logs do MySQL
npm run docker:logs
```

**Aguarde até ver a mensagem:** `ready for connections`

#### Opção B: MySQL Local

Se preferir usar MySQL instalado localmente:

1. **Instalar MySQL Server**
2. **Criar banco de dados:**
```sql
CREATE DATABASE mestredb_sql;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON mestredb_sql.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Passo 5: Compilação do TypeScript

```bash
# Compilar o projeto
npm run build

# Verificar se a compilação foi bem-sucedida
ls dist/
```

## 🧪 Executando os Primeiros Testes

### Teste 1: Verificação da Compilação

```bash
# Limpar build anterior
npm run clean

# Compilar novamente
npm run build

# Verificar estrutura gerada
ls -la dist/
```

**Resultado esperado:** Diretório `dist/` criado com estrutura similar ao `src/`

### Teste 2: Inicialização do Servidor

```bash
# Iniciar servidor em modo desenvolvimento
npm run dev
```

**Resultado esperado:**
```
[INFO] Application initializing...
[INFO] Environment variables loaded
[INFO] dotenv injected 16 environment variables from .env
[INFO] Database connection established
[INFO] Database schema synchronized
[INFO] RateLimitingService initialized with config: {"maxAttempts":5,"windowMinutes":15,"blockMinutes":15}
[INFO] Server running on port 3000
[INFO] Environment: development
[INFO] Health check available at: http://localhost:3000/api/health
[INFO] API documentation available at: http://localhost:3000/api/docs
[INFO] API endpoints available at: http://localhost:3000/api
```

### Teste 3: Verificação de Saúde da API

**Em um novo terminal:**

```bash
# Testar endpoint de saúde
curl http://localhost:3000/api/health

# Ou usando PowerShell (Windows)
Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
```

**Resultado esperado:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "0:00:30",
  "environment": "development",
  "database": "connected",
  "version": "1.0.0"
}
```

### Teste 4: Verificação da Documentação

**Abrir no navegador:**
```
http://localhost:3000/api/docs
```

**Resultado esperado:** Interface do Swagger com documentação completa da API

### Teste 5: Teste de Autenticação

#### Registrar um usuário:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

#### Fazer login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Resultado esperado:** Token JWT retornado

### Teste 6: Verificação do Rate Limiting

```bash
# Verificar status do rate limiting
curl http://localhost:3000/api/auth/rate-limit/status?identifier=test@example.com
```

**Resultado esperado:**
```json
{
  "canAttempt": true,
  "attemptsLeft": 5,
  "maxAttempts": 5,
  "windowSeconds": 900,
  "blockSeconds": 900
}
```

## 📊 Scripts Disponíveis

### Scripts de Desenvolvimento

```bash
# Iniciar em modo desenvolvimento (com hot reload)
npm run dev

# Compilar TypeScript
npm run build

# Compilar em modo watch
npm run build:watch

# Limpar build anterior
npm run clean
```

### Scripts de Banco de Dados

```bash
# Iniciar MySQL com Docker
npm run docker:up

# Parar containers Docker
npm run docker:down

# Ver logs do Docker
npm run docker:logs

# Sincronizar schema do banco
npm run schema:sync

# Executar migrações
npm run migration:run

# Reverter última migração
npm run migration:revert

# Gerar nova migração
npm run migration:generate -- -n NomeDaMigracao
```

### Scripts de Qualidade de Código

```bash
# Executar linter
npm run lint

# Corrigir problemas do linter automaticamente
npm run lint:fix

# Formatar código com Prettier
npm run format

# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🔍 Verificação de Problemas Comuns

### Problema 1: Porta já em uso

**Erro:** `EADDRINUSE: address already in use :::3000`

**Solução:**
```bash
# Verificar processo usando a porta
# Windows:
netstat -ano | findstr :3000

# macOS/Linux:
lsof -i :3000

# Matar processo ou alterar porta no .env
```

### Problema 2: Erro de conexão com MySQL

**Erro:** `ER_ACCESS_DENIED_ERROR: Access denied for user`

**Soluções:**
1. **Verificar se MySQL está rodando:**
```bash
docker ps | grep mysql
```

2. **Verificar credenciais no .env**
3. **Recriar container:**
```bash
npm run docker:down
npm run docker:up
```

### Problema 3: Dependências não instaladas

**Erro:** `Cannot find module 'express'`

**Solução:**
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Problema 4: Erro de TypeScript

**Erro:** `TS2307: Cannot find module`

**Soluções:**
1. **Verificar tsconfig.json**
2. **Reinstalar @types:**
```bash
npm install --save-dev @types/node @types/express
```

### Problema 5: Erro de CORS

**Erro:** `Access to fetch at 'http://localhost:3000' from origin 'http://localhost:3001' has been blocked by CORS policy`

**Solução:** Verificar `CORS_ORIGIN` no arquivo `.env`

## 🧪 Testes Automatizados

### Configuração do Jest

O projeto já vem configurado com Jest para testes. Para executar:

```bash
# Executar todos os testes
npm run test

# Executar testes específicos
npm run test -- --testNamePattern="User"

# Executar com coverage
npm run test:coverage

# Executar em modo watch
npm run test:watch
```

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── domain/        # Testes de entidades
│   ├── application/   # Testes de casos de uso
│   └── infrastructure/ # Testes de repositórios
├── integration/       # Testes de integração
│   ├── api/          # Testes de endpoints
│   └── database/     # Testes de banco
└── e2e/              # Testes end-to-end
    └── scenarios/    # Cenários completos
```

### Exemplo de Teste

```typescript
// tests/unit/domain/User.test.ts
import { User } from '../../../src/domain/entities/User';

describe('User Entity', () => {
  it('should create a user with valid data', () => {
    const user = new User(
      1,
      'Test User',
      'test@example.com',
      'hashedPassword',
      false,
      new Date(),
      new Date(),
      new Date()
    );

    expect(user.id).toBe(1);
    expect(user.name).toBe('Test User');
    expect(user.isAdmin()).toBe(false);
  });
});
```

## 🚀 Próximos Passos

Após completar a configuração inicial:

1. **Explorar a documentação da API** em `http://localhost:3000/api/docs`
2. **Revisar a arquitetura** no documento `01-Estruturacao-Clean-Architecture.md`
3. **Estudar a entidade usuário** no documento `02-Documentacao-Entidade-Usuario.md`
4. **Configurar aplicações externas** seguindo o documento `04-Configuracoes-Aplicacoes-Externas.md`
5. **Implementar medidas de segurança** conforme `05-Padroes-Seguranca-Implementados.md`

## 📚 Recursos Adicionais

### Documentação Oficial

- **Node.js:** https://nodejs.org/docs/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Express.js:** https://expressjs.com/
- **TypeORM:** https://typeorm.io/
- **Docker:** https://docs.docker.com/

### Ferramentas Úteis

- **Postman:** Para testar APIs
- **MySQL Workbench:** Para gerenciar banco de dados
- **Docker Desktop:** Interface gráfica para Docker

### Comandos de Diagnóstico

```bash
# Verificar versões instaladas
node --version && npm --version && docker --version

# Verificar status dos serviços
docker ps
netstat -tulpn | grep :3000

# Verificar logs da aplicação
npm run docker:logs

# Verificar estrutura do projeto
tree -I node_modules

# Verificar dependências desatualizadas
npm outdated
```

---

## ✅ Checklist de Verificação

Antes de considerar o ambiente configurado, verifique:

- [ ] Node.js v18+ instalado
- [ ] Docker funcionando
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] MySQL rodando (Docker ou local)
- [ ] Projeto compilando (`npm run build`)
- [ ] Servidor iniciando (`npm run dev`)
- [ ] Endpoint de saúde respondendo
- [ ] Documentação acessível
- [ ] Autenticação funcionando
- [ ] Rate limiting ativo

**🎉 Parabéns!** Seu ambiente de desenvolvimento está configurado e pronto para uso!

Este guia garante que você tenha uma base sólida para começar a desenvolver com o MestreDB Backend, seguindo as melhores práticas de Clean Architecture e desenvolvimento seguro.