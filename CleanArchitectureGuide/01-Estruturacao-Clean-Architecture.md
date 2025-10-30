# Estruturação do Clean Architecture - MestreDB Backend

## 📋 Visão Geral

Este documento detalha a implementação da Clean Architecture no projeto MestreDB Backend, explicando a organização em camadas, fluxo de dependências e padrões arquiteturais avançados adotados.

### 🏭 Padrões de Design Implementados

- **Factory Pattern**: Criação padronizada e controlada de objetos
- **Dependency Injection**: Gerenciamento automático de dependências
- **Service Registry**: Registro centralizado de serviços
- **Repository Pattern**: Abstração da camada de dados
- **Use Case Pattern**: Isolamento da lógica de negócio

## 🏗️ Arquitetura em Camadas

### Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRAMEWORKS & DRIVERS                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Express.js    │  │     TypeORM     │  │    MySQL    │ │
│  │   (HTTP Server) │  │   (Database)    │  │ (Database)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  INTERFACE ADAPTERS                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Controllers   │  │   Repositories  │  │ Middlewares │ │
│  │   (HTTP/API)    │  │ (Data Access)   │  │ (Security)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Use Cases     │  │    Services     │  │    DTOs     │ │
│  │ (Business Logic)│  │   (Utilities)   │  │ (Data Flow) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │    Entities     │  │   Interfaces    │  │    Rules    │ │
│  │ (Core Business) │  │  (Contracts)    │  │ (Validation)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura de Diretórios

```
src/
├── domain/                          # 🎯 CAMADA DE DOMÍNIO
│   ├── entities/                    # Entidades de negócio
│   │   ├── User.ts                  # Entidade principal do usuário
│   │   └── BaseEntity.ts            # Entidade base com propriedades comuns
│   └── interfaces/                  # Contratos e interfaces
│       ├── IUserRepository.ts       # Contrato do repositório de usuário
│       └── IBaseRepository.ts       # Contrato base para repositórios
│
├── application/                     # 🔧 CAMADA DE APLICAÇÃO
│   ├── usecases/                    # Casos de uso (regras de negócio)
│   │   ├── UserUseCases.ts          # Casos de uso do usuário
│   │   └── AuthUseCases.ts          # Casos de uso de autenticação
│   ├── services/                    # Serviços de aplicação
│   │   ├── PasswordService.ts       # Serviço de criptografia de senhas
│   │   ├── TokenService.ts          # Serviço de tokens JWT
│   │   ├── ValidationService.ts     # Serviço de validações
│   │   └── RateLimitingService.ts   # Serviço de rate limiting
│   └── dtos/                        # Data Transfer Objects
│       ├── UserDTO.ts               # DTOs relacionados ao usuário
│       └── AuthDTO.ts               # DTOs de autenticação
│
├── infrastructure/                  # 🔌 CAMADA DE INFRAESTRUTURA
│   ├── repositories/                # Implementações de repositórios
│   │   ├── UserRepository.ts        # Implementação do repositório de usuário
│   │   └── BaseRepository.ts        # Implementação base
│   ├── database/                    # Configuração e entidades do banco
│   │   ├── entities/                # Entidades do TypeORM
│   │   │   └── User.ts              # Entidade de banco do usuário
│   │   └── migrations/              # Migrações do banco
│   ├── config/                      # Configurações
│   │   ├── database.ts              # Configuração do banco de dados
│   │   └── environment.ts           # Configurações de ambiente
│   └── web/                         # Configurações web
│       └── cors.ts                  # Configuração CORS
│
├── presentation/                    # 🌐 CAMADA DE APRESENTAÇÃO
│   ├── controllers/                 # Controladores HTTP
│   │   ├── UserController.ts        # Controlador de usuários
│   │   └── AuthController.ts        # Controlador de autenticação
│   ├── routes/                      # Definição de rotas
│   │   ├── userRoutes.ts            # Rotas de usuários
│   │   ├── authRoutes.ts            # Rotas de autenticação
│   │   └── index.ts                 # Agregador de rotas
│   └── middlewares/                 # Middlewares
│       ├── authMiddleware.ts        # Middleware de autenticação
│       ├── rateLimitMiddleware.ts   # Middleware de rate limiting
│       └── errorMiddleware.ts       # Middleware de tratamento de erros
│
├── main/                            # 🏭 CAMADA PRINCIPAL (FACTORY PATTERN)
│   ├── factories/                   # Factories para criação de objetos
│   │   ├── AppFactory.ts            # Factory principal da aplicação
│   │   ├── MiddlewareFactory.ts     # Factory de middlewares
│   │   ├── RouteFactory.ts          # Factory de rotas
│   │   └── ServerFactory.ts         # Factory do servidor
│   ├── app.ts                       # Configuração da aplicação
│   ├── bootstrap.ts                 # Inicialização do sistema
│   └── server.ts                    # Servidor principal
│
├── shared/                          # 🔄 UTILITÁRIOS COMPARTILHADOS
│   ├── container/                   # Injeção de dependência
│   │   ├── DIContainer.ts           # Container principal
│   │   └── ServiceRegistry.ts       # Registro de serviços
│   ├── errors/                      # Classes de erro
│   │   ├── AppError.ts              # Erro base da aplicação
│   │   └── ValidationError.ts       # Erros de validação
│   └── utils/                       # Utilitários gerais
│       ├── auditLogger.ts           # Logger de auditoria
│       └── responseFormatter.ts     # Formatador de respostas
│
└── types/                           # 🏷️ DEFINIÇÕES DE TIPOS
    └── express.d.ts                 # Extensões de tipos do Express
```

## 🔄 Fluxo de Dependências

### Princípio da Inversão de Dependência

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controller    │───▶│    Use Case     │───▶│    Entity       │
│ (Presentation)  │    │ (Application)   │    │   (Domain)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       ▲
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Interface     │──────────────┘
         │              │   (Domain)      │
         │              └─────────────────┘
         │                       ▲
         ▼                       │
┌─────────────────┐              │
│   Repository    │──────────────┘
│(Infrastructure) │
└─────────────────┘
```

### Regras de Dependência

1. **Camadas internas não conhecem camadas externas**
2. **Dependências apontam sempre para dentro**
3. **Interfaces definem contratos entre camadas**
4. **Injeção de dependência resolve implementações**

## 🎯 Responsabilidades por Camada

### 1. Domain Layer (Núcleo)

**Responsabilidades:**
- Definir entidades de negócio
- Estabelecer regras de negócio fundamentais
- Criar interfaces/contratos
- Validações de domínio

**Exemplo - Entidade User:**
```typescript
// src/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly is_superuser: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date,
    public readonly last_access: Date,
    public readonly last_login?: Date
  ) {
    this.validateEmail();
    this.validateName();
  }

  private validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private validateName(): void {
    if (this.name.length < 2 || this.name.length > 80) {
      throw new Error('Nome deve ter entre 2 e 80 caracteres');
    }
  }

  public isAdmin(): boolean {
    return this.is_superuser;
  }
}
```

**Exemplo - Interface de Repositório:**
```typescript
// src/domain/interfaces/IUserRepository.ts
export interface IUserRepository {
  create(userData: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: number, userData: UpdateUserData): Promise<User>;
  delete(id: number): Promise<void>;
  findAll(page: number, limit: number): Promise<PaginatedResult<User>>;
}
```

### 2. Application Layer (Casos de Uso)

**Responsabilidades:**
- Orquestrar fluxos de negócio
- Coordenar entre entidades
- Aplicar regras de negócio complexas
- Gerenciar transações

**Exemplo - Use Case:**
```typescript
// src/application/usecases/UserUseCases.ts
export class UserUseCases {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService
  ) {}

  async createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
    // 1. Validação de entrada
    const userDto = plainToClass(CreateUserDTO, userData);
    const errors = await validate(userDto);
    
    if (errors.length > 0) {
      throw new ValidationError('Dados inválidos', errors);
    }

    // 2. Regra de negócio: email único
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // 3. Aplicar criptografia
    const hashedPassword = await this.passwordService.hashPassword(userData.password);

    // 4. Criar entidade
    const createData: CreateUserData = {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      is_superuser: userData.is_superuser || false
    };

    // 5. Persistir e retornar
    const user = await this.userRepository.create(createData);
    return this.mapToResponseDTO(user);
  }
}
```

### 3. Infrastructure Layer (Adaptadores)

**Responsabilidades:**
- Implementar interfaces de domínio
- Acessar recursos externos (banco, APIs)
- Configurar frameworks
- Gerenciar persistência

**Exemplo - Repositório:**
```typescript
// src/infrastructure/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async create(userData: CreateUserData): Promise<User> {
    const userEntity = this.repository.create(userData);
    const savedEntity = await this.repository.save(userEntity);
    return this.mapToDomain(savedEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({ 
      where: { email } 
    });
    return userEntity ? this.mapToDomain(userEntity) : null;
  }

  private mapToDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.name,
      entity.email,
      entity.password,
      entity.is_superuser,
      entity.created_at,
      entity.updated_at,
      entity.last_access,
      entity.last_login
    );
  }
}
```

### 4. Presentation Layer (Interface)

**Responsabilidades:**
- Receber requisições HTTP
- Validar entrada
- Chamar casos de uso
- Formatar respostas

**Exemplo - Controller:**
```typescript
// src/presentation/controllers/UserController.ts
export class UserController {
  constructor(private userUseCases: UserUseCases) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // 1. Extrair dados da requisição
      const userData: CreateUserDTO = req.body;

      // 2. Chamar caso de uso
      const user = await this.userUseCases.createUser(userData);

      // 3. Formatar resposta
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      });
    } catch (error) {
      // 4. Tratar erros
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          errors: error.details
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor'
        });
      }
    }
  }
}
```

## 🔧 Injeção de Dependência

### Container de DI

```typescript
// src/shared/container/ServiceRegistry.ts
export class ServiceRegistry {
  private static container = new DIContainer();

  static configureServices(): void {
    // Repositórios
    this.container.registerSingleton<IUserRepository>(
      'UserRepository',
      () => new UserRepository()
    );

    // Serviços
    this.container.registerSingleton<PasswordService>(
      'PasswordService',
      () => new PasswordService()
    );

    // Use Cases
    this.container.registerTransient<UserUseCases>(
      'UserUseCases',
      () => new UserUseCases(
        this.container.resolve<IUserRepository>('UserRepository'),
        this.container.resolve<PasswordService>('PasswordService')
      )
    );

    // Controllers
    this.container.registerTransient<UserController>(
      'UserController',
      () => new UserController(
        this.container.resolve<UserUseCases>('UserUseCases')
      )
    );
  }
}
```

## 📊 Fluxo de Dados Completo

### Exemplo: Criação de Usuário

```
1. HTTP Request
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

### Código do Fluxo:

```typescript
// 1. Rota
router.post('/users', userController.createUser);

// 2. Controller
async createUser(req: Request, res: Response) {
  const user = await this.userUseCases.createUser(req.body);
  res.json({ success: true, data: user });
}

// 3. Use Case
async createUser(userData: CreateUserDTO) {
  // Validações e regras de negócio
  const hashedPassword = await this.passwordService.hashPassword(userData.password);
  return await this.userRepository.create({ ...userData, password: hashedPassword });
}

// 4. Repository
async create(userData: CreateUserData) {
  const entity = this.repository.create(userData);
  return await this.repository.save(entity);
}
```

## 🏭 Factory Pattern Implementation

### Visão Geral dos Factories

O projeto implementa o Factory Pattern para centralizar e padronizar a criação de componentes da aplicação, garantindo configuração consistente e facilitando manutenção.

### 1. AppFactory - Factory Principal

```typescript
// src/main/factories/AppFactory.ts
export class AppFactory {
  static create(): Express {
    const app = express();
    
    // Configurar middlewares globais
    MiddlewareFactory.configureGlobalMiddlewares(app);
    
    // Configurar rotas
    RouteFactory.configureRoutes(app);
    
    // Configurar tratamento de erros
    MiddlewareFactory.configureErrorHandling(app);
    
    return app;
  }
}
```

### 2. MiddlewareFactory - Factory de Middlewares

```typescript
// src/main/factories/MiddlewareFactory.ts
export class MiddlewareFactory {
  static configureGlobalMiddlewares(app: Express): void {
    // CORS
    app.use(cors(corsOptions));
    
    // Rate Limiting
    app.use(rateLimitMiddleware);
    app.use(customRateLimitMiddleware);
    
    // Parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Logging
    app.use(requestLoggingMiddleware);
    
    // Swagger
    this.configureSwagger(app);
  }
  
  static configureErrorHandling(app: Express): void {
    app.use(errorHandler);
  }
}
```

### 3. RouteFactory - Factory de Rotas

```typescript
// src/main/factories/RouteFactory.ts
export class RouteFactory {
  static configureRoutes(app: Express): void {
    // Rota raiz
    app.get('/', (req, res) => {
      res.json({
        message: 'MestreDB API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    });
    
    // Rotas da API
    this.configureApiRoutes(app);
  }
  
  private static async configureApiRoutes(app: Express): Promise<void> {
    const routes = await import('../../presentation/routes');
    app.use('/api', routes.default);
  }
}
```

### 4. ServerFactory - Factory do Servidor

```typescript
// src/main/factories/ServerFactory.ts
export class ServerFactory {
  static create(): Server {
    const app = AppFactory.create();
    const port = process.env.PORT || 3000;
    
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
    
    this.configureGracefulShutdown(server);
    
    return server;
  }
  
  private static configureGracefulShutdown(server: Server): void {
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed.');
        
        try {
          await AppDataSource.destroy();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }
}
```

### Benefícios do Factory Pattern

1. **Configuração Centralizada**: Toda configuração da aplicação em um local
2. **Reutilização**: Factories podem ser reutilizados em diferentes contextos
3. **Testabilidade**: Fácil criação de mocks para testes
4. **Manutenibilidade**: Mudanças de configuração em um só lugar
5. **Consistência**: Garantia de configuração padronizada

## ✅ Benefícios da Arquitetura

### 1. **Testabilidade**
- Fácil criação de mocks
- Testes unitários isolados
- Testes de integração focados

### 2. **Manutenibilidade**
- Mudanças isoladas por camada
- Código organizado e previsível
- Fácil localização de funcionalidades

### 3. **Escalabilidade**
- Adição de novas funcionalidades sem impacto
- Substituição de tecnologias sem afetar regras de negócio
- Crescimento controlado da complexidade

### 4. **Flexibilidade**
- Troca de banco de dados
- Mudança de framework web
- Integração com novos serviços

### 5. **Clareza**
- Separação clara de responsabilidades
- Fluxo de dados previsível
- Documentação natural do código

## 🎯 Padrões Implementados

### 1. **Repository Pattern**
- Abstração do acesso a dados
- Facilita testes e mudanças de persistência

### 2. **Dependency Injection**
- Inversão de controle
- Facilita testes e manutenção

### 3. **DTO Pattern**
- Transferência segura de dados
- Validação centralizada

### 4. **Service Layer**
- Lógica de negócio reutilizável
- Separação de responsabilidades

### 5. **Factory Pattern**
- Criação controlada de objetos
- Configuração centralizada

---

## 📚 Próximos Passos

1. **Implementar testes unitários** para cada camada
2. **Adicionar logging estruturado** em todos os fluxos
3. **Implementar cache** para operações frequentes
4. **Criar documentação de API** automatizada
5. **Adicionar monitoramento** de performance

Esta arquitetura fornece uma base sólida e escalável para o desenvolvimento contínuo do MestreDB Backend, seguindo as melhores práticas da Clean Architecture.