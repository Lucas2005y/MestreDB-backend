# 🎯 Domain Layer - Camada de Domínio

## 📋 Visão Geral

A **Domain Layer** é o núcleo do negócio, completamente independente de frameworks e tecnologias externas.

**Localização:** `src/domain/`

---

## 📁 Estrutura

```
src/domain/
├── entities/              # Entidades de negócio
│   ├── User.ts
│   └── BaseEntity.ts
│
├── interfaces/            # Contratos
│   ├── IUserRepository.ts
│   └── IBaseRepository.ts
│
└── errors/                # Erros de domínio
    └── DomainError.ts
```

---

## 🏛️ Entidades

### User Entity

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

  public canAccessResource(resourceOwnerId: number): boolean {
    return this.is_superuser || this.id === resourceOwnerId;
  }
}
```

**Responsabilidades:**
- Encapsular dados do negócio
- Validar regras de domínio
- Métodos de negócio

---

## 📜 Interfaces (Contratos)

### IUserRepository

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

**Responsabilidades:**
- Definir contratos para repositórios
- Abstrair acesso a dados
- Independente de implementação

---

## ⚠️ Erros de Domínio

```typescript
// src/domain/errors/DomainError.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

---

## ✅ Regras da Domain Layer

### PODE fazer:
✅ Definir entidades
✅ Criar interfaces
✅ Validar regras de negócio
✅ Lançar erros de domínio

### NÃO PODE fazer:
❌ Importar frameworks (Express, TypeORM)
❌ Conhecer camadas externas
❌ Acessar banco de dados
❌ Fazer requisições HTTP

---

## 📚 Referências

- [Application Layer](./APPLICATION_LAYER.md)
- [Infrastructure Layer](./INFRASTRUCTURE_LAYER.md)
- [Guia Completo](../../CleanArchitectureGuide/01-Estruturacao-Clean-Architecture.md)
