# Guia de Implementação Clean Architecture

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Padrões de Design Implementados](#padrões-de-design-implementados)
4. [Fluxo de Implementação](#fluxo-de-implementação)
5. [Boas Práticas](#boas-práticas)
6. [Exemplos de Código](#exemplos-de-código)
7. [Checklist de Verificação](#checklist-de-verificação)
8. [Diagramas UML](#diagramas-uml)

---

## Visão Geral

A Clean Architecture é um padrão arquitetural que promove a separação de responsabilidades através de camadas bem definidas, garantindo que a lógica de negócio seja independente de frameworks, UI, banco de dados e outros detalhes externos.

Este projeto implementa uma versão avançada da Clean Architecture, incorporando padrões modernos como Factory Pattern, Dependency Injection e Service Registry para maior flexibilidade e manutenibilidade.

### Princípios Fundamentais

1. **Independência de Frameworks**: A arquitetura não depende de bibliotecas externas
2. **Testabilidade**: Regras de negócio podem ser testadas sem UI, BD, servidor web, etc.
3. **Independência de UI**: A UI pode mudar facilmente sem alterar o resto do sistema
4. **Independência de Banco de Dados**: Regras de negócio não estão vinculadas ao banco
5. **Independência de Agentes Externos**: Regras de negócio não sabem nada sobre o mundo exterior

---

## Estrutura de Diretórios

```
src/
├── domain/                          # Camada de Entidades (Core)
│   ├── entities/                    # Entidades de negócio
│   ├── models/                      # Modelos de domínio
│   │   └── db/                      # Modelos específicos do banco
│   ├── repositories/                # Contratos de repositório
│   ├── use-cases/                   # Contratos de casos de uso
│   │   ├── entity-events/           # Eventos de entidade
│   │   ├── actions/                 # Ações de negócio
│   │   └── functions/               # Funções de negócio
│   ├── errors/                      # Erros de domínio
│   ├── validators/                  # Validadores de negócio
│   └── utils/                       # Utilitários de domínio
├── data/                            # Camada de Casos de Uso
│   └── use-cases/                   # Implementações dos casos de uso
│       ├── entity-events/
│       ├── actions/
│       └── functions/
├── infra/                           # Camada de Interface/Adaptadores
│   ├── db/                          # Adaptadores de banco de dados
│   │   └── repositories/            # Implementações de repositório
│   ├── http/                        # Adaptadores HTTP
│   ├── external-services/           # Serviços externos
│   └── utils/                       # Utilitários de infraestrutura
├── presentation/                    # Camada de Interface/Adaptadores
│   ├── controllers/                 # Controladores
│   ├── entity-events/               # Controladores de eventos
│   ├── middlewares/                 # Middlewares
│   └── base/                        # Classes base
└── main/                            # Camada de Frameworks/Drivers
    ├── factories/                   # Fábricas de dependências
    │   ├── controllers/
    │   └── use-cases/
    ├── routes/                      # Definições de rotas
    ├── annotations/                 # Anotações de UI
    └── scripts/                     # Scripts de configuração
```

---

## Fluxo de Implementação

### 1. Definição da Entidade Principal

#### 1.1 Modelo CDS (Para projetos SAP CAP)
```cds
// db/models/{entity-name}.cds
namespace db.models;

using { db.models } from '.';

entity {EntityName}s {
    key id: UUID;
        // Adicione campos específicos da entidade
        name: String(100);
        description: String(500);
        isActive: Boolean default true;
        createdAt: DateTime;
        updatedAt: DateTime;
        // Relacionamentos
        category: Association to models.Categories;
}
```

#### 1.2 Modelo de Domínio
```typescript
// src/domain/models/db/{entity-name}.ts
export type {EntityName}Props = {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
};

export class {EntityName}Model {
    constructor(private props: {EntityName}Props) {}

    public static basic(props: {EntityName}Props): {EntityName}Model {
        return new {EntityName}Model(props);
    }

    // Getters
    public get id(): string { return this.props.id; }
    public get name(): string { return this.props.name; }
    public get description(): string { return this.props.description; }
    public get isActive(): boolean { return this.props.isActive; }
    public get createdAt(): string { return this.props.createdAt; }
    public get updatedAt(): string { return this.props.updatedAt; }
    public get categoryId(): string { return this.props.categoryId; }

    // Setters
    public set name(name: string) { this.props.name = name; }
    public set description(description: string) { this.props.description = description; }
    public set isActive(isActive: boolean) { this.props.isActive = isActive; }

    // Métodos de negócio
    public activate(): void {
        this.props.isActive = true;
    }

    public deactivate(): void {
        this.props.isActive = false;
    }

    // Validações
    public validate(): ValidationResult {
        const errors: ValidationErrorWithArgs[] = [];

        if (!this.props.name || this.props.name.trim().length === 0) {
            errors.push(new ValidationErrorWithArgs('REQUIRED_FIELD', ['name']));
        }

        if (this.props.name && this.props.name.length > 100) {
            errors.push(new ValidationErrorWithArgs('MAX_LENGTH_EXCEEDED', ['name', '100']));
        }

        return new ValidationResult(errors);
    }
}
```

### 2. Criação dos Contratos de Repositório

#### 2.1 Interface do Repositório
```typescript
// src/domain/repositories/{entity-name}.ts
import { {EntityName}Model } from '@/domain/models/db/{entity-name}';

export interface {EntityName}Repository {
    findAll(): Promise<{EntityName}Model[] | null>;
    findById(id: string): Promise<{EntityName}Model | null>;
    findByName(name: string): Promise<{EntityName}Model | null>;
    create(entity: {EntityName}Model): Promise<{EntityName}Model>;
    update(entity: {EntityName}Model): Promise<{EntityName}Model>;
    delete(id: string): Promise<void>;
    softDelete(ids: string[]): Promise<void>;
}
```

#### 2.2 Implementação do Repositório
```typescript
// src/infra/db/repositories/{entity-name}.ts
import cds from '@sap/cds';
import { {EntityName}Model } from '@/domain/models/db/{entity-name}';
import { {EntityName}Repository } from '@/domain/repositories/{entity-name}';

export class {EntityName}RepositoryImpl implements {EntityName}Repository {
    private readonly ENTITY_NAME = 'db.models.{EntityName}s';

    async findAll(): Promise<{EntityName}Model[] | null> {
        const query = cds.ql.SELECT.from(this.ENTITY_NAME);
        const results = await cds.run(query);

        if (results.length === 0) return null;

        return results.map(item => {EntityName}Model.basic({
            id: item.id,
            name: item.name,
            description: item.description,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            categoryId: item.category_id
        }));
    }

    async findById(id: string): Promise<{EntityName}Model | null> {
        const query = cds.ql.SELECT.from(this.ENTITY_NAME).where({ id });
        const result = await cds.run(query);

        if (!result || result.length === 0) return null;

        const item = result[0];
        return {EntityName}Model.basic({
            id: item.id,
            name: item.name,
            description: item.description,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            categoryId: item.category_id
        });
    }

    async create(entity: {EntityName}Model): Promise<{EntityName}Model> {
        const query = cds.ql.INSERT.into(this.ENTITY_NAME).entries({
            id: entity.id,
            name: entity.name,
            description: entity.description,
            isActive: entity.isActive,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category_id: entity.categoryId
        });

        await cds.run(query);
        return entity;
    }

    async update(entity: {EntityName}Model): Promise<{EntityName}Model> {
        const query = cds.ql.UPDATE.entity(this.ENTITY_NAME)
            .set({
                name: entity.name,
                description: entity.description,
                isActive: entity.isActive,
                updatedAt: new Date().toISOString()
            })
            .where({ id: entity.id });

        await cds.run(query);
        return entity;
    }

    async delete(id: string): Promise<void> {
        const query = cds.ql.DELETE.from(this.ENTITY_NAME).where({ id });
        await cds.run(query);
    }

    async softDelete(ids: string[]): Promise<void> {
        const query = cds.ql.UPDATE.entity(this.ENTITY_NAME)
            .set({ isActive: false })
            .where({ id: { in: ids } });
        await cds.run(query);
    }
}
```

### 3. Implementação dos Casos de Uso

#### 3.1 Contratos de Casos de Uso
```typescript
// src/domain/use-cases/entity-events/{entity-name}/before-create.ts
import { Either } from '@sweet-monads/either';
import { AbstractError } from '@/domain/errors';
import { {EntityName}Props } from '@/domain/models/db/{entity-name}';

export interface BeforeCreate{EntityName}UseCase {
    execute(params: BeforeCreate{EntityName}UseCase.Params): BeforeCreate{EntityName}UseCase.Result;
}

export namespace BeforeCreate{EntityName}UseCase {
    export type Params = {EntityName}Props;
    export type Result = Either<AbstractError, {EntityName}Props>;
}
```

#### 3.2 Implementação dos Casos de Uso
```typescript
// src/data/use-cases/entity-events/{entity-name}/before-create.ts
import { left, right } from '@sweet-monads/either';
import { BadRequestError } from '@/domain/errors/bad-request';
import { ServerError } from '@/domain/errors/server';
import { {EntityName}Model } from '@/domain/models/db/{entity-name}';
import { BeforeCreate{EntityName}UseCase } from '@/domain/use-cases/entity-events/{entity-name}';
import { Translator } from '@/domain/utils/translator';

export class BeforeCreate{EntityName}UseCaseImpl implements BeforeCreate{EntityName}UseCase {
    constructor(private readonly translator: Translator) {}

    public execute(params: BeforeCreate{EntityName}UseCase.Params): BeforeCreate{EntityName}UseCase.Result {
        try {
            const entity = {EntityName}Model.basic(params);
            const validationResult = entity.validate();

            if (!validationResult.isValid) {
                const translatedErrors = validationResult.errors.map(error =>
                    error.translate(this.translator)
                );
                return left(new BadRequestError(translatedErrors));
            }

            return right(params);
        } catch (error) {
            const errorData = error as Error;
            return left(new ServerError(errorData.stack, errorData.message));
        }
    }
}
```

### 4. Desenvolvimento dos Adaptadores

#### 4.1 Controllers
```typescript
// src/presentation/entity-events/{entity-name}/before-create.ts
import { BeforeCreate{EntityName}UseCase } from '@/domain/use-cases/entity-events/{entity-name}';
import { BaseControllerImpl, BaseControllerResponse } from '@/presentation/base/controller';
import { Translator } from '@/domain/utils/translator';

export class BeforeCreate{EntityName}Controller extends BaseControllerImpl {
    constructor(
        private readonly useCase: BeforeCreate{EntityName}UseCase,
        private readonly translator: Translator
    ) {
        super();
    }

    public execute(params: BeforeCreate{EntityName}UseCase.Params): BaseControllerResponse {
        const result = this.useCase.execute(params);

        if (result.isLeft()) {
            return this.error(result.value.code, result.value.toErrorDetails());
        }

        return this.success(result.value);
    }
}
```

### 5. Configuração dos Frameworks Externos

#### 5.1 Factories de Use Cases
```typescript
// src/main/factories/use-cases/entity-events/{entity-name}/before-create.ts
import { BeforeCreate{EntityName}UseCaseImpl } from '@/data/use-cases/entity-events/{entity-name}/before-create';
import { BeforeCreate{EntityName}UseCase } from '@/domain/use-cases/entity-events/{entity-name}';
import { translator } from '@/main/factories/utils/translator';

export const makeBeforeCreate{EntityName}UseCase = (): BeforeCreate{EntityName}UseCase => {
    return new BeforeCreate{EntityName}UseCaseImpl(translator);
};
```

#### 5.2 Factories de Controllers
```typescript
// src/main/factories/controllers/entity-events/{entity-name}/before-create.ts
import { makeBeforeCreate{EntityName}UseCase } from '@/main/factories/use-cases/entity-events/{entity-name}';
import { translator } from '@/main/factories/utils/translator';
import { BeforeCreate{EntityName}Controller } from '@/presentation/entity-events/{entity-name}';

export const makeBeforeCreate{EntityName}Controller = (): BeforeCreate{EntityName}Controller => {
    const useCase = makeBeforeCreate{EntityName}UseCase();
    return new BeforeCreate{EntityName}Controller(useCase, translator);
};
```

#### 5.3 Configuração de Rotas
```typescript
// src/main/routes/main.cds
using { db.models } from '../../../db/models';

@path: '/api'
@requires: 'authenticated-user'
service MainService {
    entity {EntityName}s as projection on models.{EntityName}s;
}
```

---

## Boas Práticas

### Regras de Dependência entre Camadas

1. **Camadas internas não conhecem camadas externas**
   - Domain não conhece Data, Infra, Presentation ou Main
   - Data só conhece Domain
   - Infra e Presentation só conhecem Domain e Data
   - Main conhece todas as camadas

2. **Inversão de Dependência**
   - Use interfaces para definir contratos
   - Implemente as interfaces nas camadas externas
   - Injete dependências através de construtores

3. **Fluxo de Controle**
   ```
   Main → Presentation → Data → Domain
   Main → Infra → Data → Domain
   ```

### Padrões de Injeção de Dependência

#### Factory Pattern
```typescript
// Centralize a criação de objetos
export const make{EntityName}Repository = (): {EntityName}Repository => {
    return new {EntityName}RepositoryImpl();
};

export const make{EntityName}UseCase = (): {EntityName}UseCase => {
    const repository = make{EntityName}Repository();
    return new {EntityName}UseCaseImpl(repository);
};
```

#### Composition Root
```typescript
// Todas as dependências são resolvidas na camada Main
export const make{EntityName}Controller = () => {
    const repository = make{EntityName}Repository();
    const useCase = make{EntityName}UseCase(repository);
    return new {EntityName}Controller(useCase);
};
```

### Estratégias de Teste por Camada

#### Testes de Domínio
```typescript
// Teste modelos e validações
describe('{EntityName}Model', () => {
    it('should create a valid entity', () => {
        const props = {
            id: 'uuid',
            name: 'Test Entity',
            description: 'Test Description',
            isActive: true,
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
            categoryId: 'category-uuid'
        };

        const entity = {EntityName}Model.basic(props);
        expect(entity.name).toBe('Test Entity');
    });

    it('should validate required fields', () => {
        const props = { ...validProps, name: '' };
        const entity = {EntityName}Model.basic(props);
        const result = entity.validate();

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
    });
});
```

#### Testes de Use Cases
```typescript
// Use mocks para dependências externas
describe('BeforeCreate{EntityName}UseCase', () => {
    let useCase: BeforeCreate{EntityName}UseCase;
    let mockTranslator: jest.Mocked<Translator>;

    beforeEach(() => {
        mockTranslator = {
            translate: jest.fn().mockReturnValue('Translated message')
        };
        useCase = new BeforeCreate{EntityName}UseCaseImpl(mockTranslator);
    });

    it('should return success for valid entity', () => {
        const params = { /* valid params */ };
        const result = useCase.execute(params);

        expect(result.isRight()).toBe(true);
    });
});
```

#### Testes de Integração
```typescript
// Teste a integração entre camadas
describe('{EntityName} Integration', () => {
    let repository: {EntityName}Repository;

    beforeEach(async () => {
        // Setup test database
        repository = new {EntityName}RepositoryImpl();
    });

    it('should create and retrieve entity', async () => {
        const entity = {EntityName}Model.basic(validProps);
        await repository.create(entity);

        const retrieved = await repository.findById(entity.id);
        expect(retrieved).toBeDefined();
        expect(retrieved?.name).toBe(entity.name);
    });
});
```

### Tratamento de Erros e Exceções

#### Hierarquia de Erros
```typescript
// src/domain/errors/abstract-error.ts
export abstract class AbstractError extends Error {
    abstract readonly code: number;
    abstract readonly name: string;

    abstract toErrorDetails(): ErrorDetails[];
}

// src/domain/errors/bad-request.ts
export class BadRequestError extends AbstractError {
    readonly code = 400;
    readonly name = 'BadRequestError';

    constructor(private errors: ValidationErrorWithArgs[]) {
        super('Bad Request');
    }

    toErrorDetails(): ErrorDetails[] {
        return this.errors.map(error => ({
            status: this.code,
            message: error.message,
            target: error.field
        }));
    }
}
```

#### Either Pattern para Tratamento de Erros
```typescript
import { Either, left, right } from '@sweet-monads/either';

// Use cases retornam Either<Error, Success>
public execute(params: Params): Either<AbstractError, Result> {
    try {
        // Lógica do use case
        return right(result);
    } catch (error) {
        return left(new ServerError(error.message));
    }
}
```

---

## Exemplos de Código

### Exemplo Completo: Entidade Product

#### 1. Modelo CDS
```cds
// db/models/product.cds
namespace db.models;

using { db.models } from '.';

entity Products {
    key id: UUID;
        name: String(100) not null;
        description: String(500);
        price: Decimal(10,2) not null;
        isActive: Boolean default true;
        createdAt: DateTime;
        updatedAt: DateTime;
        category: Association to models.Categories;
}
```

#### 2. Modelo de Domínio
```typescript
// src/domain/models/db/product.ts
export type ProductProps = {
    id: string;
    name: string;
    description: string;
    price: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
};

export class ProductModel {
    constructor(private props: ProductProps) {}

    public static basic(props: ProductProps): ProductModel {
        return new ProductModel(props);
    }

    // Getters
    public get id(): string { return this.props.id; }
    public get name(): string { return this.props.name; }
    public get price(): number { return this.props.price; }

    // Métodos de negócio
    public applyDiscount(percentage: number): void {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Invalid discount percentage');
        }
        this.props.price = this.props.price * (1 - percentage / 100);
    }

    public validate(): ValidationResult {
        const errors: ValidationErrorWithArgs[] = [];

        if (!this.props.name?.trim()) {
            errors.push(new ValidationErrorWithArgs('REQUIRED_FIELD', ['name']));
        }

        if (this.props.price <= 0) {
            errors.push(new ValidationErrorWithArgs('INVALID_PRICE', []));
        }

        return new ValidationResult(errors);
    }
}
```

#### 3. Repository
```typescript
// src/domain/repositories/product.ts
export interface ProductRepository {
    findAll(): Promise<ProductModel[] | null>;
    findById(id: string): Promise<ProductModel | null>;
    findByCategory(categoryId: string): Promise<ProductModel[] | null>;
    create(product: ProductModel): Promise<ProductModel>;
    update(product: ProductModel): Promise<ProductModel>;
    delete(id: string): Promise<void>;
}

// src/infra/db/repositories/product.ts
export class ProductRepositoryImpl implements ProductRepository {
    private readonly ENTITY_NAME = 'db.models.Products';

    async findByCategory(categoryId: string): Promise<ProductModel[] | null> {
        const query = cds.ql.SELECT.from(this.ENTITY_NAME)
            .where({ category_id: categoryId, isActive: true });
        const results = await cds.run(query);

        if (results.length === 0) return null;

        return results.map(item => ProductModel.basic({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isActive: item.isActive,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            categoryId: item.category_id
        }));
    }
}
```

---

## Checklist de Verificação

### ✅ Estrutura de Camadas
- [ ] Domain layer não possui dependências externas
- [ ] Use cases estão na camada Data
- [ ] Repositories têm interfaces no Domain e implementações na Infra
- [ ] Controllers estão na camada Presentation
- [ ] Factories estão na camada Main

### ✅ Regras de Dependência
- [ ] Camadas internas não conhecem camadas externas
- [ ] Todas as dependências apontam para dentro
- [ ] Interfaces são usadas para inversão de dependência
- [ ] Nenhuma importação viola as regras de camada

### ✅ Modelos de Domínio
- [ ] Modelos encapsulam propriedades
- [ ] Métodos de negócio estão nos modelos
- [ ] Validações estão implementadas
- [ ] Factory methods estão disponíveis

### ✅ Use Cases
- [ ] Cada use case tem uma responsabilidade única
- [ ] Retornam Either<Error, Success>
- [ ] Não dependem de frameworks externos
- [ ] Têm interfaces bem definidas

### ✅ Repositories
- [ ] Interfaces estão no Domain
- [ ] Implementações estão na Infra
- [ ] Métodos são assíncronos quando necessário
- [ ] Tratam casos de "não encontrado"

### ✅ Controllers
- [ ] Adaptam requisições para use cases
- [ ] Tratam erros adequadamente
- [ ] Não contêm lógica de negócio
- [ ] Retornam respostas padronizadas

### ✅ Factories
- [ ] Centralizam criação de objetos
- [ ] Resolvem todas as dependências
- [ ] Estão na camada Main
- [ ] Facilitam testes com mocks

### ✅ Tratamento de Erros
- [ ] Hierarquia de erros bem definida
- [ ] Either pattern implementado
- [ ] Erros de domínio separados de erros técnicos
- [ ] Mensagens de erro traduzidas

### ✅ Testes
- [ ] Testes unitários para modelos de domínio
- [ ] Testes unitários para use cases com mocks
- [ ] Testes de integração para repositories
- [ ] Cobertura de código adequada

### ✅ Configuração
- [ ] Injeção de dependência configurada
- [ ] Rotas definidas corretamente
- [ ] Middlewares aplicados adequadamente
- [ ] Configurações externalizadas

---

## Diagramas UML

### Diagrama de Camadas
```
┌─────────────────────────────────────────────────────────────┐
│                        Main Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Factories    │  │     Routes      │  │  Scripts     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Controllers   │  │   Middlewares   │  │     Base     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Repositories  │  │   HTTP Client   │  │   External   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Use Cases     │  │   Validators    │  │   Mappers    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │    Entities     │  │   Repositories  │  │  Use Cases   │ │
│  │    (Models)     │  │  (Interfaces)   │  │ (Interfaces) │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Diagrama de Fluxo de Dependências
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Request   │───▶│ Controller  │───▶│  Use Case   │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Response   │◀───│   Factory   │    │ Repository  │
└─────────────┘    └─────────────┘    └─────────────┘
                                              │
                                              ▼
                                      ┌─────────────┐
                                      │  Database   │
                                      └─────────────┘
```

---

## Conclusão

Este guia fornece uma base sólida para implementar Clean Architecture em projetos. Lembre-se de que a arquitetura deve servir ao projeto, não o contrário. Adapte as práticas conforme necessário, mas sempre mantendo os princípios fundamentais de separação de responsabilidades e independência de frameworks.

### Próximos Passos

1. **Implemente uma entidade simples** seguindo este guia
2. **Escreva testes** para validar a implementação
3. **Refatore código existente** gradualmente
4. **Documente decisões arquiteturais** específicas do projeto
5. **Treine a equipe** nos conceitos e práticas

### Recursos Adicionais

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Implementing Clean Architecture](https://github.com/ardalis/CleanArchitecture)
- [Clean Architecture Template](https://github.com/jasontaylordev/CleanArchitecture)

---

*Este documento deve ser atualizado conforme a evolução do projeto e novas práticas são adotadas.*