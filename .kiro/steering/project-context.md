# Contexto do Projeto MestreDB Backend

API REST para gerenciamento de usuários desenvolvida seguindo os princípios da Clean Architecture.

## Stack Técnica
- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript
- **Framework Web**: Express.js
- **ORM**: TypeORM
- **Banco de Dados**: MySQL (com Docker)
- **Autenticação**: JWT (access + refresh tokens)
- **Validação**: class-validator
- **Criptografia**: bcrypt (12 salt rounds)
- **Testes**: Jest + Supertest
- **Documentação**: Swagger/OpenAPI

## Arquitetura Clean Architecture

### Camadas e Responsabilidades

**Domain Layer** (`src/domain/`)
- Entidades de negócio puras (User, BaseEntity)
- Interfaces/contratos (IUserRepository, IBaseRepository)
- Regras de negócio fundamentais
- Erros de domínio

**Application Layer** (`src/application/`)
- Casos de uso (UserUseCases, AuthUseCases)
- Serviços (PasswordService, TokenService, ValidationService, RateLimitingService)
- DTOs (CreateUserDTO, UpdateUserDTO, UserResponseDTO)
- Lógica de negócio complexa

**Infrastructure Layer** (`src/infrastructure/`)
- Repositórios (UserRepository implementa IUserRepository)
- Configurações (database, environment, swagger)
- Entidades TypeORM (mapeamento para banco)
- Integrações externas

**Presentation Layer** (`src/presentation/`)
- Controllers (UserController, AuthController)
- Rotas (userRoutes, authRoutes)
- Middlewares (auth, rate limit, error handling, CORS)

**Main Layer** (`src/main/`)
- **Factory Pattern**: AppFactory, MiddlewareFactory, RouteFactory, ServerFactory
- Bootstrap e inicialização do sistema
- Configuração da aplicação

**Shared Layer** (`src/shared/`)
- DIContainer (Dependency Injection)
- ServiceRegistry (registro de serviços)
- Utilitários (auditLogger, responseFormatter)
- Erros customizados

## Padrões de Design Implementados

1. **Factory Pattern**: Criação controlada de objetos (AppFactory coordena toda inicialização)
2. **Dependency Injection**: Container DI para gerenciamento de dependências
3. **Service Registry**: Registro centralizado de serviços
4. **Repository Pattern**: Abstração da camada de dados
5. **Use Case Pattern**: Lógica de negócio isolada em casos de uso

## Sistema de Autenticação e Autorização

### Autenticação JWT
- **Access Token**: 1 hora (JWT_EXPIRES_IN, padrão: '1h')
- **Refresh Token**: 7 dias (REFRESH_TOKEN_EXPIRES_IN)
- **Blacklist**: Tokens invalidados no logout
- **Middleware**: `authenticateToken` valida e injeta dados do usuário
- **Nota**: O código lê `JWT_EXPIRES_IN`, não `JWT_ACCESS_EXPIRES_IN`

### Níveis de Permissão
- **Usuário Normal**: Gerencia apenas própria conta
- **Superusuário**: Gerencia todas as contas (exceto deletar própria)

### Middlewares de Autorização
- `requireSuperUser`: Apenas superusuários
- `requireOwnershipOrSuperUser`: Próprio usuário ou admin
- `requireOwnershipOrSuperUserForModification`: Modificação com validação
- `requireOwnershipOrSuperUserForDeletion`: Deleção com proteção especial

## Segurança Implementada

### Rate Limiting
- **Global**: express-rate-limit para proteção geral
- **Customizado**: Sistema próprio com bloqueio temporário
- **Login**: 5 tentativas por 15 minutos (IP + email)
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Proteções
- CORS configurável via CORS_ORIGIN
- Validação de entrada com class-validator
- Sanitização de dados
- Criptografia bcrypt (12 salt rounds)
- Audit logging para rastreamento
- Graceful shutdown para encerramento seguro

## Estrutura do Banco de Dados

### Tabela `users`
```sql
- id: BIGINT (PK, AUTO_INCREMENT)
- name: VARCHAR(80)
- email: VARCHAR(254) UNIQUE
- password: VARCHAR(128) - hash bcrypt
- is_superuser: BOOLEAN (default: false)
- last_login: DATETIME (nullable)
- last_access: DATETIME
- created_at: DATETIME
- updated_at: DATETIME
```

### Usuário Admin Padrão
- Email: admin@mestredb.com
- Senha: MinhaSenh@123

## Endpoints Principais

### Autenticação (Público)
- POST `/api/auth/register` - Registro público
- POST `/api/auth/login` - Login
- POST `/api/auth/refresh` - Renovar token
- POST `/api/auth/logout` - Logout (requer auth)
- GET `/api/auth/me` - Dados do usuário logado

### Usuários
- POST `/api/usuarios` - Criar (superusuário)
- GET `/api/usuarios` - Listar com paginação (superusuário)
- GET `/api/usuarios/:id` - Buscar (próprio ou admin)
- PUT `/api/usuarios/:id` - Atualizar (próprio ou admin)
- DELETE `/api/usuarios/:id` - Deletar (próprio ou admin*)

## Convenções de Código

### Nomenclatura
- **Classes**: PascalCase (UserController, PasswordService)
- **Interfaces**: PascalCase com prefixo I (IUserRepository)
- **Arquivos**: PascalCase para classes, camelCase para utilitários
- **Variáveis/Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Estrutura de Arquivos
- Um arquivo por classe/interface
- Factories em `src/main/factories/`
- DTOs em `src/application/dtos/`
- Testes espelham estrutura do src

### Validação
- Usar class-validator nos DTOs
- Validações de domínio nas entidades
- Validações de negócio nos use cases

### Tratamento de Erros
- Erros customizados em `src/shared/errors/`
- Middleware centralizado de erros
- Sempre retornar JSON estruturado

### Respostas da API
```typescript
// Sucesso
{ success: true, data: {...}, message?: string }

// Erro
{ success: false, error: string, message: string, details?: any }
```

## Scripts Importantes

```bash
npm run dev              # Desenvolvimento com nodemon
npm run build            # Compilar TypeScript
npm run start            # Produção
npm run docker:up        # Subir MySQL + phpMyAdmin
npm run test             # Executar testes
npm run test:coverage    # Testes com cobertura
npm run lint:fix         # Corrigir lint
```

## Variáveis de Ambiente Essenciais

```env
# Servidor
PORT=3000
NODE_ENV=development

# MySQL (Docker)
MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USERNAME=root
MYSQL_PASSWORD=admin123
MYSQL_DATABASE=mestredb_sql

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=1h                    # Access token (código lê JWT_EXPIRES_IN, não JWT_ACCESS_EXPIRES_IN)
REFRESH_TOKEN_EXPIRES_IN=7d          # Refresh token

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_BLOCK_MINUTES=15

# Admin
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=MinhaSenh@123
```

## Fluxo de Inicialização

1. ServerFactory.create()
2. AppFactory.create()
3. MiddlewareFactory.configureGlobalMiddlewares() (CORS, rate limit, parsing, logging, swagger)
4. RouteFactory.configureRoutes() (health checks, API routes)
5. MiddlewareFactory.configureErrorHandling()
6. Server.listen()
7. Graceful shutdown configuration

## Documentação Adicional

Consulte a pasta `CleanArchitectureGuide/` para documentação detalhada:
- 01-Estruturacao-Clean-Architecture.md
- 02-Documentacao-Entidade-Usuario.md
- 05-Padroes-Seguranca-Implementados.md
- 06-Factory-Pattern-Implementation.md

## Swagger/API Docs
- Desenvolvimento: http://localhost:3000/api-docs
- JSON: http://localhost:3000/api-docs.json
