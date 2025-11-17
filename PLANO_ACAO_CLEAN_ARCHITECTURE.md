# 🎯 Plano de Ação Prioritário - Clean Architecture

## 📊 Status Atual do Projeto

**Nível de Conformidade com Clean Architecture: 80%** ✅

### ✅ Pontos Fortes Implementados
- [x] Estrutura de camadas correta (Domain, Application, Infrastructure, Presentation, Main)
- [x] Dependency Injection com Container DI
- [x] Factory Pattern para criação de objetos
- [x] Repository Pattern com interfaces no Domain
- [x] Either Pattern implementado (`UserUseCasesWithEither`)
- [x] Hierarquia robusta de erros de domínio
- [x] Cobertura de testes (unitários e integração)
- [x] Validações básicas na entidade User

---

## 🚧 Gaps Identificados e Plano de Ação

### **FASE 1 - CRÍTICO** 🔴 (1-2 semanas)

#### 1. **Migração Completa para Either Pattern**
**Status:** 🟡 Parcialmente implementado
- ✅ `UserUseCasesWithEither` implementado
- ❌ `UserUseCases` ainda usa exceções tradicionais
- ❌ Controllers ainda usam try/catch

**Ações:**
```typescript
// 1.1 Migrar UserUseCases.ts para Either
async createUser(userData: CreateUserDTO): Promise<Either<DomainError, UserResponseDTO>>

// 1.2 Atualizar AuthController.ts e UserController.ts
const result = await this.userUseCases.createUser(req.body);
result.fold(
  error => res.status(400).json({ error: error.message }),
  user => res.json(user)
);

// 1.3 Remover todos os try/catch dos controllers
```

**Arquivos a modificar:**
- `src/application/usecases/UserUseCases.ts`
- `src/application/usecases/AuthUseCases.ts`
- `src/presentation/controllers/UserController.ts`
- `src/presentation/controllers/AuthController.ts`

#### 2. **Centralizar Validações no Domain**
**Status:** 🟡 Parcialmente implementado
- ✅ Validações básicas na entidade User
- ❌ DTOs ainda usam class-validator (dependência externa)

**Ações:**
```typescript
// 2.1 Expandir validações na entidade User
export class User {
  static validateCreateData(data: CreateUserData): Either<ValidationError, CreateUserData>
  static validateUpdateData(data: UpdateUserData): Either<ValidationError, UpdateUserData>
}

// 2.2 Remover class-validator dos DTOs
// 2.3 Usar validações do Domain nos Use Cases
```

**Arquivos a modificar:**
- `src/domain/entities/User.ts`
- `src/application/dtos/UserDTO.ts`
- `src/application/usecases/UserUseCases.ts`

#### 3. **Use Cases Mais Granulares**
**Status:** ❌ Use Cases muito grandes
- ❌ `UserUseCases` tem muitas responsabilidades
- ❌ Falta separação por ação específica

**Ações:**
```typescript
// 3.1 Criar Use Cases específicos
CreateUserUseCase
UpdateUserUseCase
GetUserByIdUseCase
DeleteUserUseCase
AuthenticateUserUseCase
RefreshTokenUseCase

// 3.2 Refatorar controllers para usar Use Cases específicos
```

**Arquivos a criar:**
- `src/application/usecases/user/CreateUserUseCase.ts`
- `src/application/usecases/user/UpdateUserUseCase.ts`
- `src/application/usecases/user/GetUserByIdUseCase.ts`
- `src/application/usecases/user/DeleteUserUseCase.ts`
- `src/application/usecases/auth/AuthenticateUserUseCase.ts`
- `src/application/usecases/auth/RefreshTokenUseCase.ts`

---

### **FASE 2 - IMPORTANTE** 🟡 (2-4 semanas)

#### 4. **Logging Estruturado**
**Status:** ❌ Logging básico com console.log

**Ações:**
```typescript
// 4.1 Criar interface ILogger
interface ILogger {
  info(message: string, context?: object): void;
  error(message: string, error?: Error, context?: object): void;
  warn(message: string, context?: object): void;
  debug(message: string, context?: object): void;
}

// 4.2 Implementar logger concreto
// 4.3 Substituir console.log por logger estruturado
```

**Arquivos a criar:**
- `src/domain/interfaces/ILogger.ts`
- `src/infrastructure/logging/Logger.ts`
- `src/shared/container/ServiceRegistry.ts` (atualizar)

#### 5. **Value Objects**
**Status:** ❌ Primitivos obsession

**Ações:**
```typescript
// 5.1 Criar Value Objects básicos
class Email {
  constructor(private readonly value: string) {
    this.validate();
  }
}

class Password {
  constructor(private readonly value: string) {
    this.validate();
  }
}

class UserId {
  constructor(private readonly value: number) {
    this.validate();
  }
}
```

**Arquivos a criar:**
- `src/domain/value-objects/Email.ts`
- `src/domain/value-objects/Password.ts`
- `src/domain/value-objects/UserId.ts`

#### 6. **Melhorar Cobertura de Testes**
**Status:** 🟡 Boa cobertura, mas pode melhorar

**Ações:**
- 6.1 Testes para todos os novos Use Cases granulares
- 6.2 Testes para Value Objects
- 6.3 Testes de integração para Either Pattern
- 6.4 Configurar coverage report

---

### **FASE 3 - MELHORIAS** 🟢 (1-2 meses)

#### 7. **Domain Events**
**Status:** ❌ Não implementado

**Ações:**
```typescript
// 7.1 Criar sistema de eventos
interface DomainEvent {
  aggregateId: string;
  eventType: string;
  occurredOn: Date;
}

class UserCreatedEvent implements DomainEvent {
  constructor(public readonly user: User) {}
}

// 7.2 Implementar Event Dispatcher
// 7.3 Criar Event Handlers
```

#### 8. **Specifications Pattern**
**Status:** ❌ Não implementado

**Ações:**
```typescript
// 8.1 Criar interface Specification
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

// 8.2 Implementar specifications específicas
class ActiveUserSpecification implements Specification<User>
class AdminUserSpecification implements Specification<User>
```

#### 9. **Cache Layer**
**Status:** ❌ Não implementado

**Ações:**
- 9.1 Implementar cache para consultas frequentes
- 9.2 Cache de tokens JWT
- 9.3 Cache de rate limiting

---

### **FASE 4 - AVANÇADO** 🔵 (futuro)

#### 10. **CQRS (Command Query Responsibility Segregation)**
**Status:** ❌ Não implementado
- Separar comandos (write) de queries (read)

#### 11. **Aggregate Roots**
**Status:** ❌ Entidades simples
- Implementar agregados para operações complexas

#### 12. **Ports and Adapters mais explícitos**
**Status:** 🟡 Interfaces básicas
- Criar ports mais específicos para cada adaptador

---

## 📈 Cronograma de Implementação

### Semana 1-2: Fase 1 (Crítico)
- [ ] Migrar UserUseCases para Either Pattern
- [ ] Atualizar Controllers para usar fold()
- [ ] Centralizar validações no Domain
- [ ] Criar Use Cases granulares

### Semana 3-6: Fase 2 (Importante)
- [ ] Implementar logging estruturado
- [ ] Criar Value Objects básicos
- [ ] Melhorar cobertura de testes
- [ ] Documentar mudanças

### Mês 2-3: Fase 3 (Melhorias)
- [ ] Implementar Domain Events
- [ ] Adicionar Specifications Pattern
- [ ] Implementar Cache Layer
- [ ] Otimizar performance

### Futuro: Fase 4 (Avançado)
- [ ] Implementar CQRS
- [ ] Criar Aggregate Roots
- [ ] Refinar Ports and Adapters

---

## 🎯 Métricas de Sucesso

### Fase 1 Completa:
- ✅ 100% dos Use Cases usando Either Pattern
- ✅ 0 try/catch nos Controllers
- ✅ Validações centralizadas no Domain
- ✅ Use Cases granulares implementados

### Fase 2 Completa:
- ✅ Logger estruturado em toda aplicação
- ✅ Value Objects implementados
- ✅ Cobertura de testes > 90%

### Fase 3 Completa:
- ✅ Sistema de eventos funcionando
- ✅ Specifications implementadas
- ✅ Cache layer operacional

---

## 📚 Recursos de Referência

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Either Pattern em TypeScript](https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja)
- [Domain Events](https://martinfowler.com/eaaDev/DomainEvent.html)
- [Specification Pattern](https://martinfowler.com/apsupp/spec.pdf)

---

**Última atualização:** $(date)
**Responsável:** Equipe de Desenvolvimento
**Status:** 🟡 Em Progresso - Fase 1