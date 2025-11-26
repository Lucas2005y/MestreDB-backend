# 📦 Guia de Instalação - MestreDB Backend

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Obrigatórios
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (vem com Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Docker** e **Docker Compose** ([Download](https://www.docker.com/))

### Recomendados
- **VS Code** ou editor de sua preferência
- **Postman** ou **Insomnia** para testar API
- **MySQL Workbench** ou **DBeaver** (opcional, temos phpMyAdmin)

### Verificar Instalação

```bash
# Verificar Node.js
node --version
# Deve mostrar: v18.x.x ou superior

# Verificar npm
npm --version
# Deve mostrar: 9.x.x ou superior

# Verificar Git
git --version

# Verificar Docker
docker --version
docker-compose --version
```

---

## 🚀 Instalação Passo a Passo

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/Lucas2005y/MestreDB-backend.git

# Entre na pasta do projeto
cd MestreDB-backend
```

---

### 2. Instalar Dependências

```bash
# Instalar todas as dependências do projeto
npm install

# Aguarde a instalação (pode levar alguns minutos)
```

**Dependências principais instaladas:**
- Express.js (framework web)
- TypeORM (ORM)
- TypeScript (linguagem)
- Jest (testes)
- bcrypt (criptografia)
- jsonwebtoken (JWT)
- class-validator (validação)
- E muitas outras...

---

### 3. Configurar Variáveis de Ambiente

Os arquivos de ambiente já estão configurados! Você só precisa verificar:

```bash
# Verificar se os arquivos existem
ls .env*

# Deve mostrar:
# .env.development  (desenvolvimento - já configurado)
# .env.test        (testes - já configurado)
# .env.production  (produção - configurar no servidor)
# .env.example     (template)
```

**Configuração padrão (`.env.development`):**
- MySQL na porta 3307 (Docker)
- Usuário admin: admin@mestredb.com
- Senha admin: MinhaSenh@123
- JWT secret para desenvolvimento

**Não precisa alterar nada para desenvolvimento local!**

---

### 4. Iniciar Banco de Dados (Docker)

```bash
# Subir MySQL e phpMyAdmin
npm run docker:up

# Aguardar ~30 segundos para o MySQL inicializar
```

**Verificar se está rodando:**
```bash
docker ps

# Deve mostrar:
# - mestredb_mysql (porta 3307)
# - mestredb_phpmyadmin (porta 8080)
```

**Acessar phpMyAdmin:**
- URL: http://localhost:8080
- Usuário: `root`
- Senha: `root`

---

### 5. Aplicar Migrations do Banco de Dados

⚠️ **IMPORTANTE:** Agora usamos migrations para criar as tabelas!

```bash
# Ver status das migrations
npm run migration:show

# Aplicar migrations pendentes
npm run migration:run
```

**Saída esperada:**
```
[X] CreateUsersTable1732636800000
Migration CreateUsersTable1732636800000 has been executed successfully.
```

**O que isso faz:**
- ✅ Cria tabela `users` com todos os campos
- ✅ Cria índices necessários
- ✅ Registra migration aplicada

**Mais sobre migrations:** [Guia de Migrations](../05-database/migrations/QUICK_REFERENCE.md)

---

### 6. Iniciar Aplicação

```bash
# Iniciar MySQL e phpMyAdmin
npm run docker:up

# Aguarde alguns segundos para o MySQL inicializar
```

**Serviços iniciados:**
- **MySQL**: `localhost:3307`
  - Usuário: `root`
  - Senha: `root`
  - Database: `mestredb_sql`

- **phpMyAdmin**: `http://localhost:8080`
  - Usuário: `root`
  - Senha: `root`

**Verificar se está rodando:**
```bash
# Ver logs do Docker
npm run docker:logs

# Ou verificar containers
docker ps
```

---

### 5. Build do Projeto

```bash
# Compilar TypeScript para JavaScript
npm run build

# Deve criar a pasta 'dist' com código compilado
```

---

### 6. Iniciar Aplicação

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Deve mostrar:
# 🔍 Tentando carregar: .env.development
# ✅ Ambiente carregado: development (.env.development)
# ✅ Conexão com MySQL estabelecida
# 🚀 Servidor rodando na porta 3000
```

**Aplicação rodando em:**
- API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/api/health`
- Swagger Docs: `http://localhost:3000/api-docs`

---

## ✅ Verificar Instalação

### 1. Testar Health Check

```bash
# Windows PowerShell
curl http://localhost:3000/api/health

# Ou abra no navegador:
# http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2025-01-10T...",
  "environment": "development"
}
```

### 2. Acessar Swagger

Abra no navegador: `http://localhost:3000/api-docs`

Você verá a documentação interativa da API!

### 3. Testar Login

```bash
# Fazer login com usuário admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mestredb.com",
    "password": "MinhaSenh@123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@mestredb.com",
    "is_superuser": true
  }
}
```

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Iniciar em modo desenvolvimento
npm run build            # Compilar TypeScript
npm run start            # Iniciar versão compilada
```

### Docker
```bash
npm run docker:up        # Iniciar MySQL + phpMyAdmin
npm run docker:down      # Parar containers
npm run docker:logs      # Ver logs
```

### Testes
```bash
npm test                 # Executar todos os testes
npm run test:watch       # Testes em modo watch
npm run test:coverage    # Testes com coverage
```

### Banco de Dados
```bash
npm run migration:generate -- NomeDaMigration  # Gerar migration
npm run migration:run                          # Executar migrations
npm run migration:revert                       # Reverter última migration
```

### Qualidade de Código
```bash
npm run lint             # Verificar lint
npm run lint:fix         # Corrigir lint automaticamente
npm run format           # Formatar código
```

---

## 🐛 Problemas Comuns

### Erro: "Port 3307 already in use"

**Solução:**
```bash
# Parar containers existentes
npm run docker:down

# Ou matar processo na porta
# Windows
netstat -ano | findstr :3307
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3307 | xargs kill -9
```

### Erro: "Cannot connect to MySQL"

**Solução:**
```bash
# Verificar se Docker está rodando
docker ps

# Reiniciar containers
npm run docker:down
npm run docker:up

# Aguardar 10-15 segundos para MySQL inicializar
```

### Erro: "Module not found"

**Solução:**
```bash
# Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "TypeScript compilation failed"

**Solução:**
```bash
# Limpar build anterior
npm run clean

# Rebuild
npm run build
```

---

## 📚 Próximos Passos

Agora que você instalou tudo:

1. 📖 [Início Rápido](./QUICK_START.md) - Aprenda a usar a API
2. 🏗️ [Estrutura do Projeto](./PROJECT_STRUCTURE.md) - Entenda a organização
3. 🔧 [Guia de Desenvolvimento](../03-development/DEVELOPMENT_GUIDE.md) - Comece a desenvolver

---

## 🆘 Precisa de Ajuda?

- 📖 [FAQ](../08-troubleshooting/FAQ.md)
- 🐛 [Erros Comuns](../08-troubleshooting/COMMON_ERRORS.md)
- 💬 [Abrir Issue](https://github.com/Lucas2005y/MestreDB-backend/issues)

---

**Última atualização:** 2025-01-10
