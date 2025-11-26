# 🏗️ Estrutura do Projeto - MestreDB Backend

## 📋 Visão Geral

O MestreDB Backend segue a **Clean Architecture**, organizando o código em camadas bem definidas com responsabilidades claras.

---

## 📁 Estrutura de Pastas

```
MestreDB-backend/
├── src/                          # Código fonte
│   ├── domain/                   # 🎯 Camada de Domínio
│   ├── application/              # 🔧 Camada de Aplicação
│   ├── infrastructure/           # 🔌 Camada de Infraestrutura
│   │   ├── config/              # Configurações
│   │   └── database/
│   │       ├── entities/        # Entidades TypeORM
│   │       └── migrations/      # 🔄 Migrations do banco
│   ├── presentation/             # 🌐 Camada de Apresentação
│   ├── main/                     # 🏭 Camada Principal (Factory)
│   ├── shared/                   # 🔄 Código Compartilhado
│   ├── types/                    # 🏷️ Tipos TypeScript
│   ├── __tests__/                # 🧪 Testes (200+ testes)
│   │   ├── unit/                # Testes unitários
│   │   ├── integration/         # Testes de integração
│   │   └── mocks/               # Mocks para testes
│   └── index.ts                  # Ponto de entrada
│
├── docs/                         # 📚 Documentação completa
│   ├── 01-getting-started/      # Início rápido
│   ├── 02-architecture/         # Arquitetura
│   ├── 03-development/          # Desenvolvimento
│   ├── 04-features/             # Funcionalidades
│   ├── 05-database/             # Banco + Migrations
│   ├── 06-api-reference/        # API docs
│   ├── 07-deployment/           # Deploy
│   ├── 08-troubleshooting/      # FAQ
│   ├── 09-roadmap/              # Melhorias
│   └── 10-contributing/         # Como contribuir
│
├── logs/                         # 📝 Logs da aplicação
├── dist/                         # 📦 Código compilado
├── coverage/                     # 📊 Relatórios de cobertura
├── node_modules/                 # 📦 Dependências
│
├── .env.development              # ⚙️ Config desenvolvimento
├── .env.test                     # ⚙️ Config testes
├── .env.production               # ⚙️ Config produção
├── .env.example                  # ⚙️ Template
│
├── ormconfig.ts                  # ⚙️ Config TypeORM (migrations)
├── docker-compose.yml            # 🐳 Config Docker
├── package.json                  # 📦 Dependências e scripts
├── tsconfig.json                 # ⚙️ Config TypeScript
├── jest.config.js                # 🧪 Config Jest
└── README.md                     # 📖 Documentação principal
```

---

## 🎯 Camadas da Arquitetura

### 1. Domain Layer (`src/domain/`)

**O que é:** Núcleo do negócio, independente de frameworks

**Contém:**
```
src/domain/
├── entities/              # Entidades de negócio
│   ├── User.ts           # Entidade User
│   └── BaseEntity.ts     # Entidade base
│
├── interfaces/            # Contratos
│   ├── IUserRepository.ts
│   └── IBaseRepository.ts
│
└── errors/                # Erros de domínio
    └── DomainError.ts
```

**Responsabilidades:**
- Definir entidades de negócio
- Estabelecer regras de negócio fundamentais
- Criar interfaces/contratos
- Validações de domínio

**Exemplo:**
```typescript
// src/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    // ...
  ) {
    this.validateEmail();
  }

  private validateEmail(): void {
    // Regra de negócio
  }

  public isAdmin(): boolean {
    return this.is_superuser;
  }
}
```

---

### 2. Application Layer (`src/application/`)

**O que é:** Casos de uso e lógica de aplicação

**Contém:**
```
src/application/
├── usecases/              # Casos de uso
│   ├── UserUseCases.ts
│   └── AuthUseCases.ts
│
├── services/              # Serviços
│   ├── PasswordService.ts
│   ├── TokenService.ts
│   ├── ValidationService.ts
│   └── RateLimitingService.ts
│
└── dtos/                  # Data Transfer Objects
    ├── UserDTO.ts
    └── AuthDTO.ts
```

**Responsabilidades:**
- Orquestrar fluxos de negócio
- Coordenar entre entidades
- Aplicar regras de negócio complexas
- Gerenciar transações

**Exemplo:**
```typescript
// src/application/usecases/UserUseCases.ts
export class UserUseCases {
  async createUser(userData: CreateUserDTO) {
    // 1. Validar
    // 2. Verificar regras de negócio
    // 3. Criptografar senha
    // 4. Persistir
    // 5. Retornar
  }
}
```

---

### 3. Infrastructure Layer (`src/infrastructure/`)

**O que é:** Implementações técnicas e integrações

**Contém:**
```
src/infrastructure/
├── repositories/          # Implementações de repositórios
│   ├── UserRepository.ts
│   └── BaseRepository.ts
│
├── database/              # Configuração do banco
│   ├── entities/         # Entidades TypeORM
│   │   └── User.ts
│   └── migrations/       # Migrations
│
├── config/                # Configurações
│   ├── database.ts
│   ├── environment.ts
│   └── swagger.ts
│
└── web/                   # Configurações web
    └── cors.ts
```

**Responsabilidades:**
- Implementar interfaces de domínio
- Acessar recursos externos (banco, APIs)
- Configurar frameworks
- Gerenciar persistência

**Exemplo:**
```typescript
// src/infrastructure/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  async create(userData: CreateUserData): Promise<User> {
    const userEntity = this.repository.create(userData);
    const saved = await this.repository.save(userEntity);
    return this.mapToDomain(saved);
  }
}
```

---

### 4. Presentation Layer (`src/presentation/`)

**O que é:** Interface com o mundo externo (HTTP)

**Contém:**
```
src/presentation/
├── controllers/           # Controladores HTTP
│   ├── UserController.ts
│   └── AuthController.ts
│
├── routes/                # Definição de rotas
│   ├── userRoutes.ts
│   ├── authRoutes.ts
│   └── index.ts
│
└── middlewares/           # Middlewares
    ├── authMiddleware.ts
    ├── rateLimitMiddleware.ts
    └── errorMiddleware.ts
```

**Responsabilidades:**
- Receber requisições HTTP
- Validar entrada
- Chamar casos de uso
- Formatar respostas

**Exemplo:**
```typescript
// src/presentation/controllers/UserController.ts
export class UserController {
  async createUser(req: Request, res: Response) {
    const userData = req.body;
    const user = await this.userUseCases.createUser(userData);
    res.status(201).json({ success: true, data: user });
  }
}
```

---

### 5. Main Layer (`src/main/`)

**O que é:** Factory Pattern e inicialização

**Contém:**
```
src/main/
├── factories/             # Factories
│   ├── AppFactory.ts
│   ├── MiddlewareFactory.ts
│   ├── RouteFactory.ts
│   └── ServerFactory.ts
│
├── app.ts                 # Configuração da app
├── bootstrap.ts           # Inicialização
└── server.ts              # Servidor principal
```

**Responsabilidades:**
- Criar e configurar objetos
- Resolver dependências
- Inicializar aplicação
- Configurar servidor

**Exemplo:**
```typescript
// src/main/factories/AppFactory.ts
export class AppFactory {
  static create(): Express {
    const app = express();
    MiddlewareFactory.configureGlobalMiddlewares(app);
    RouteFactory.configureRoutes(app);
    return app;
  }
}
```

---

### 6. Shared Layer (`src/shared/`)

**O que é:** Código compartilhado entre camadas

**Contém:**
```
src/shared/
├── container/             # Dependency Injection
│   ├── DIContainer.ts
│   └── ServiceRegistry.ts
│
├── errors/                # Erros customizados
│   ├── AppError.ts
│   └── ValidationError.ts
│
└── utils/                 # Utilitários
    ├── auditLogger.ts
    └── responseFormatter.ts
```

**Responsabilidades:**
- Injeção de dependência
- Erros customizados
- Utilitários gerais
- Helpers compartilhados

---

## 🔄 Fluxo de Dados

### Exemplo: Criar Usuário

```
1. HTTP Request (POST /api/usuarios)
   ↓
2. Router (Express)
   ↓
3. Middleware (Auth, Validation)
   ↓
4. Controller (UserController.createUser)
   ↓
5. Use Case (UserUseCases.createUser)
   ├── Validation Service
   ├── Password Service
   └── User Repository
       ↓
6. Database (TypeORM + MySQL)
   ↓
7. Response (JSON)
```

### Fluxo Detalhado

```typescript
// 1. Rota
router.post('/usuarios', userController.createUser);

// 2. Controller
async createUser(req, res) {
  const user = await this.userUseCases.createUser(req.body);
  res.json({ success: true, data: user });
}

// 3. Use Case
async createUser(userData) {
  const hashedPassword = await this.passwordService.hash(userData.password);
  return await this.userRepository.create({ ...userData, password: hashedPassword });
}

// 4. Repository
async create(userData) {
  const entity = this.repository.create(userData);
  return await this.repository.save(entity);
}
```

---

## 📝 Convenções de Nomenclatura

### Arquivos e Pastas
- **PascalCase** para classes: `UserController.ts`, `PasswordService.ts`
- **camelCase** para utilitários: `auditLogger.ts`, `responseFormatter.ts`
- **kebab-case** para rotas: `user-routes.ts`, `auth-routes.ts`

### Código
- **Classes**: `PascalCase` - `UserController`, `PasswordService`
- **Interfaces**: `PascalCase` com `I` - `IUserRepository`, `IBaseRepository`
- **Variáveis/Funções**: `camelCase` - `createUser`, `validateEmail`
- **Constantes**: `UPPER_SNAKE_CASE` - `JWT_SECRET`, `MAX_ATTEMPTS`

### Pastas
- **Singular** para tipos: `entity/`, `interface/`, `service/`
- **Plural** para coleções: `entities/`, `interfaces/`, `services/`

---

## 🗂️ Onde Encontrar Cada Coisa

### Preciso criar uma nova entidade
📁 `src/domain/entities/`

### Preciso criar um novo caso de uso
📁 `src/application/usecases/`

### Preciso criar um novo endpoint
📁 `src/presentation/routes/` e `src/presentation/controllers/`

### Preciso configurar o banco
📁 `src/infrastructure/config/database.ts`

### Preciso adicionar um middleware
📁 `src/presentation/middlewares/`

### Preciso criar um serviço
📁 `src/application/services/`

### Preciso criar um DTO
📁 `src/application/dtos/`

### Preciso criar uma migration
```bash
npm run migration:generate -- NomeDaMigration
# Arquivo criado em: src/infrastructure/database/migrations/
```

---

## 🎯 Regras de Dependência

### Princípio Fundamental
**Dependências sempre apontam para dentro (para o domínio)**

```
Presentation → Application → Domain
Infrastructure → Domain
Main → Todos (mas ninguém depende de Main)
```

### O que PODE fazer
✅ Controller pode usar Use Case
✅ Use Case pode usar Repository Interface
✅ Repository pode implementar Interface do Domain
✅ Qualquer camada pode usar Shared

### O que NÃO PODE fazer
❌ Domain não pode conhecer Application
❌ Domain não pode conhecer Infrastructure
❌ Application não pode conhecer Presentation
❌ Use Case não pode conhecer Controller

---

## 📚 Próximos Passos

Agora que você entende a estrutura:

1. 🏗️ [Arquitetura Detalhada](../02-architecture/OVERVIEW.md)
2. 🔧 [Guia de Desenvolvimento](../03-development/DEVELOPMENT_GUIDE.md)
3. ✨ [Criando Features](../03-development/CREATING_FEATURES.md)

---

## 💡 Dicas

### Navegando no Código
- Use Ctrl+P (VS Code) para buscar arquivos rapidamente
- Siga as importações para entender dependências
- Comece pelo `src/index.ts` para ver o fluxo de inicialização

### Entendendo o Fluxo
1. Comece pelas rotas (`src/presentation/routes/`)
2. Veja os controllers (`src/presentation/controllers/`)
3. Entenda os use cases (`src/application/usecases/`)
4. Veja as entidades (`src/domain/entities/`)

### Adicionando Funcionalidades
1. Defina a entidade em `domain/`
2. Crie o use case em `application/`
3. Implemente o repository em `infrastructure/`
4. Crie o controller em `presentation/`
5. Adicione a rota em `presentation/routes/`

---

**Última atualização:** 2025-01-10
