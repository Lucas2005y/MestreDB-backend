# MestreDB Backend API

API REST para gerenciamento de usuários desenvolvida seguindo os princípios da Clean Architecture, utilizando Node.js, TypeScript, TypeORM e MySQL. Implementa padrões avançados de design como Factory Pattern, Dependency Injection e Service Registry.

## 📚 Documentação

**A documentação completa está organizada em:** [`docs/`](./docs/)

### 🚀 Início Rápido
- 📦 [Guia de Instalação](./docs/01-getting-started/INSTALLATION.md) - Como instalar e configurar
- 🎯 [Início Rápido](./docs/01-getting-started/QUICK_START.md) - Primeiros passos
- 🏗️ [Estrutura do Projeto](./docs/01-getting-started/PROJECT_STRUCTURE.md) - Organização do código

### 📖 Documentação Completa
- [Arquitetura](./docs/02-architecture/) - Clean Architecture e padrões
- [Desenvolvimento](./docs/03-development/) - Guias de desenvolvimento
- [Funcionalidades](./docs/04-features/) - Autenticação, usuários, segurança
- [Deploy](./docs/05-deployment/) - Produção e ambientes
- [API Reference](./docs/06-api-reference/) - Endpoints e exemplos
- [Banco de Dados](./docs/07-database/) - Schema e migrations
- [Troubleshooting](./docs/08-troubleshooting/) - FAQ e erros comuns

**📋 Índice Completo:** [docs/README.md](./docs/README.md)

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express.js** - Framework web minimalista
- **TypeORM** - ORM para TypeScript e JavaScript
- **MySQL** - Sistema de gerenciamento de banco de dados
- **Docker** - Containerização
- **Swagger** - Documentação da API
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de dados
- **JWT** - Autenticação completa implementada
- **express-rate-limit** - Rate limiting avançado
- **express-slow-down** - Controle de velocidade de requisições

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** com padrões avançados de design, organizando o código em camadas bem definidas:

```
src/
├── domain/              # Camada de Domínio
│   ├── entities/        # Entidades de negócio
│   └── interfaces/      # Contratos e interfaces
├── application/         # Camada de Aplicação
│   ├── dtos/           # Data Transfer Objects
│   ├── services/       # Serviços de aplicação
│   └── usecases/       # Casos de uso
├── infrastructure/     # Camada de Infraestrutura
│   ├── config/         # Configurações e inicializadores
│   ├── database/       # Entidades e modelos do banco
│   ├── repositories/   # Implementação dos repositórios
│   └── web/           # Configurações web
├── presentation/       # Camada de Apresentação
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares (auth, rate limit, etc.)
│   └── routes/         # Rotas da API
├── main/               # Camada Principal (Factory Pattern)
│   ├── factories/      # Factories para criação de objetos
│   ├── app.ts         # Configuração da aplicação
│   ├── bootstrap.ts   # Inicialização do sistema
│   └── server.ts      # Servidor principal
├── shared/            # Código compartilhado
│   ├── container/     # Dependency Injection Container
│   ├── errors/        # Tratamento de erros
│   └── utils/         # Utilitários
└── types/             # Definições de tipos TypeScript
```

### 🏭 Padrões de Design Implementados

- **Factory Pattern**: Criação controlada de objetos (AppFactory, MiddlewareFactory, RouteFactory)
- **Dependency Injection**: Container DI para gerenciamento de dependências
- **Service Registry**: Registro centralizado de serviços
- **Repository Pattern**: Abstração da camada de dados
- **Use Case Pattern**: Lógica de negócio isolada

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Docker e Docker Compose
- Git

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Lucas2005y/MestreDB-backend.git
cd MestreDB-backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
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

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin padrão
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=admin123
```

4. **Inicie o banco de dados MySQL com Docker:**
```bash
npm run docker:up
```

5. **Execute o projeto em modo de desenvolvimento:**
```bash
npm run dev
```

## 🐳 Docker

### Comandos disponíveis:

```bash
# Iniciar containers
npm run docker:up

# Parar containers
npm run docker:down

# Ver logs dos containers
npm run docker:logs

# Inicializar banco de dados
npm run db:init
```

### Serviços disponíveis:

- **MySQL**: `localhost:3306`
- **phpMyAdmin**: `http://localhost:8080`

## 📚 Documentação da API

A documentação da API está disponível via Swagger UI:

- **Desenvolvimento**: `http://localhost:3000/api-docs`
- **JSON da documentação**: `http://localhost:3000/api-docs.json`

### Endpoints principais:

#### 🔐 Autenticação (Público):
| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/auth/register` | 🆕 Registro público de usuário | ❌ Não requer |
| POST | `/api/auth/login` | Login de usuário | ❌ Não requer |
| POST | `/api/auth/refresh` | Renovar token de acesso | ❌ Não requer |
| POST | `/api/auth/logout` | Logout de usuário | ✅ Requer token |
| GET | `/api/auth/me` | Informações do usuário logado | ✅ Requer token |

#### 👥 Gestão de Usuários:
| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/api/health` | Health check da API | ❌ Público |
| POST | `/api/usuarios` | Criar usuário (Admin) | 👑 Superusuário |
| GET | `/api/usuarios` | Listar usuários | 👑 Superusuário |
| GET | `/api/usuarios/:id` | Buscar usuário por ID | 👤 Próprio ou 👑 Admin |
| PUT | `/api/usuarios/:id` | Atualizar usuário | 👤 Próprio ou 👑 Admin |
| DELETE | `/api/usuarios/:id` | Excluir usuário | 👤 Próprio ou 👑 Admin* |

**\* Superusuários não podem deletar a própria conta**

## 🗄️ Banco de Dados

### Estrutura da tabela `users`:

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    last_access DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Usuário administrador padrão:

- **Email**: `admin@mestredb.com`
- **Senha**: `admin123`
- **Tipo**: Superusuário

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🔨 Scripts de Desenvolvimento

```bash
# Desenvolvimento
npm run dev              # Iniciar em modo desenvolvimento
npm run build            # Compilar TypeScript
npm run build:watch      # Compilar em modo watch
npm run start            # Iniciar versão compilada

# Banco de dados
npm run typeorm          # CLI do TypeORM
npm run migration:generate  # Gerar migration
npm run migration:run    # Executar migrations
npm run migration:revert # Reverter migration
npm run schema:sync      # Sincronizar schema

# Qualidade de código
npm run lint             # Verificar lint
npm run lint:fix         # Corrigir lint automaticamente
npm run format           # Formatar código

# Docker
npm run docker:up        # Subir containers
npm run docker:down      # Parar containers
npm run docker:logs      # Ver logs
```

## 📝 Exemplos de Uso

### Criar usuário:

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "is_superuser": false
  }'
```

### Listar usuários:

```bash
curl -X GET "http://localhost:3000/api/usuarios?page=1&limit=10"
```

### Buscar usuário por ID:

```bash
curl -X GET http://localhost:3000/api/usuarios/1
```

## ✨ Funcionalidades

### 🆕 Sistema de Registro e Autenticação:
- **Registro Público**: Qualquer pessoa pode criar uma conta via `/api/auth/register`
- **Login/Logout**: Sistema completo de autenticação com JWT
- **Refresh Token**: Renovação automática de tokens de acesso
- **Token Blacklist**: Sistema de invalidação de tokens para logout seguro
- **Auto-gestão**: Usuários podem gerenciar suas próprias contas

### 👥 Sistema de Permissões:
- **Usuários Normais**: Podem visualizar, editar e deletar apenas suas próprias contas
- **Superusuários**: Podem gerenciar todas as contas (exceto deletar a própria)
- **Proteção de Segurança**: Superusuários não podem deletar suas próprias contas

### 🔐 Middlewares de Autorização:
- `requireSuperUser`: Apenas superusuários
- `requireOwnershipOrSuperUser`: Próprio usuário ou superusuário
- `requireOwnershipOrSuperUserForModification`: Modificação de conta própria ou por admin
- `requireOwnershipOrSuperUserForDeletion`: Deleção com proteção especial para admins

### 🛡️ Sistema de Rate Limiting:
- **Rate Limiting Global**: Proteção contra spam e ataques DDoS
- **Rate Limiting Customizado**: Limites específicos por endpoint
- **Slow Down**: Redução gradual de velocidade para requisições excessivas
- **Configuração Flexível**: Limites ajustáveis por ambiente

### 🏭 Arquitetura Avançada:
- **Factory Pattern**: Criação padronizada de componentes da aplicação
- **Dependency Injection**: Gerenciamento automático de dependências
- **Service Registry**: Registro centralizado de todos os serviços
- **Audit Logging**: Sistema de auditoria para rastreamento de ações
- **Graceful Shutdown**: Encerramento seguro da aplicação

## 🔒 Segurança

- **Criptografia de Senhas**: bcrypt com salt rounds 12 para máxima segurança
- **Validação de Entrada**: class-validator para sanitização de dados
- **Middleware de Erros**: Tratamento centralizado e seguro de exceções
- **CORS Configurável**: Controle de origem de requisições
- **Autenticação JWT**: Sistema completo com access e refresh tokens
- **Token Blacklist**: Invalidação segura de tokens no logout
- **Rate Limiting**: Proteção contra ataques de força bruta e DDoS
- **Slow Down**: Redução gradual de velocidade para requisições suspeitas
- **Audit Logging**: Rastreamento de ações para auditoria de segurança
- **Graceful Shutdown**: Encerramento seguro preservando dados em processamento

## 🚀 Deploy

### Variáveis de ambiente para produção:

```env
NODE_ENV=production
PORT=3000
MYSQL_HOST=seu_host_mysql
MYSQL_PORT=3306
MYSQL_USERNAME=seu_usuario
MYSQL_PASSWORD=sua_senha_segura
MYSQL_DATABASE=mestredb_sql
JWT_SECRET=seu_jwt_secret_super_seguro_para_producao
CORS_ORIGIN=https://seu-frontend.com
```

### Build para produção:

```bash
npm run build
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Equipe MestreDB** - *Desenvolvimento inicial*

## 📞 Suporte

Para suporte, envie um email para contato@mestredb.com ou abra uma issue no GitHub.

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!