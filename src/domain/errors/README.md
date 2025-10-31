# Sistema de Erros de Domínio e Either Pattern

Este documento explica como usar o sistema de erros de domínio e o padrão Either implementado no projeto.

## 📋 Visão Geral

O sistema implementa:
- **Hierarquia de erros de domínio** estruturada
- **Padrão Either<Error, Success>** para tratamento funcional de erros
- **Validações no Domain Layer** seguindo Clean Architecture

## 🏗️ Estrutura de Erros

### DomainError (Classe Base)
```typescript
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
}
```

### ValidationError (Erros de Validação)
```typescript
export class ValidationError extends DomainError {
  public readonly field?: string;
  
  // Métodos estáticos para criação
  static invalidEmail(email: string): ValidationError
  static fieldRequired(fieldName: string): ValidationError
  static fieldTooShort(fieldName: string, minLength: number): ValidationError
}
```

### UserError (Erros Específicos de Usuário)
```typescript
export class UserError extends DomainError {
  // Métodos estáticos para criação
  static notFound(id?: string): UserError
  static emailAlreadyExists(email: string): UserError
  static invalidCredentials(): UserError
}
```

## 🔄 Either Pattern

### Conceitos Básicos

O Either é um tipo que pode representar **sucesso** (Right) ou **erro** (Left):

```typescript
// Sucesso
const success: Either<Error, User> = right(user);

// Erro
const error: Either<ValidationError, User> = left(ValidationError.invalidEmail("test"));
```

### Métodos Principais

#### map() - Transforma o valor de sucesso
```typescript
const result: Either<Error, User> = getUserById(1);
const userName: Either<Error, string> = result.map(user => user.name);
```

#### flatMap() - Encadeia operações que retornam Either
```typescript
const result = getUserById(1)
  .flatMap(user => updateUser(user.id, { name: "Novo Nome" }))
  .flatMap(updatedUser => saveUser(updatedUser));
```

#### fold() - Executa função baseada no resultado
```typescript
const message = result.fold(
  error => `Erro: ${error.message}`,
  user => `Usuário: ${user.name}`
);
```

## 🎯 Uso Prático

### 1. Validações na Entidade User

```typescript
// Criar usuário com validações
const userResult = User.create(1, "João", "joao@email.com", "123456");

if (userResult.isLeft()) {
  console.error("Erro de validação:", userResult.value.message);
  return;
}

const user = userResult.value;
```

### 2. Use Cases com Either

```typescript
async createUser(userData: CreateUserDTO): Promise<Either<DomainError, UserResponseDTO>> {
  // Validar dados
  const nameValidation = User.validateName(userData.name);
  if (nameValidation.isLeft()) {
    return left(nameValidation.value);
  }

  // Verificar email existente
  const existingUser = await this.userRepository.findByEmail(userData.email);
  if (existingUser) {
    return left(UserError.emailAlreadyExists(userData.email));
  }

  // Criar usuário
  const user = await this.userRepository.create(userData);
  return right(this.mapToResponseDTO(user));
}
```

### 3. Tratamento de Erros Assíncronos

```typescript
const userResult = await tryCatchAsync(
  () => this.userRepository.findById(id),
  (error) => new DomainError(`Erro de banco: ${error}`, 'DATABASE_ERROR')
);

if (userResult.isLeft()) {
  return left(userResult.value);
}
```

### 4. Controllers com Either

```typescript
async createUser(req: Request, res: Response) {
  const result = await this.userUseCases.createUser(req.body);
  
  result.fold(
    error => res.status(400).json({ error: error.message, code: error.code }),
    user => res.status(201).json(user)
  );
}
```

## ✅ Vantagens do Sistema

### 1. **Type Safety**
- Compilador força tratamento de erros
- Não há exceções não tratadas

### 2. **Composabilidade**
- Operações podem ser encadeadas facilmente
- Código mais limpo e legível

### 3. **Rastreabilidade**
- Todos os erros têm código e timestamp
- Fácil debugging e logging

### 4. **Separação de Responsabilidades**
- Validações no Domain Layer
- Erros específicos por contexto

## 🔧 Migração Gradual

### Passo 1: Usar validações da entidade
```typescript
// Antes
if (!userData.email || !isValidEmail(userData.email)) {
  throw new Error("Email inválido");
}

// Depois
const emailValidation = User.validateEmail(userData.email);
if (emailValidation.isLeft()) {
  throw new Error(emailValidation.value.message);
}
```

### Passo 2: Implementar Either nos Use Cases
```typescript
// Antes
async createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
  // pode lançar exceções
}

// Depois
async createUser(userData: CreateUserDTO): Promise<Either<DomainError, UserResponseDTO>> {
  // retorna Either explicitamente
}
```

### Passo 3: Atualizar Controllers
```typescript
// Antes
try {
  const user = await this.userUseCases.createUser(req.body);
  res.json(user);
} catch (error) {
  res.status(400).json({ error: error.message });
}

// Depois
const result = await this.userUseCases.createUser(req.body);
result.fold(
  error => res.status(400).json({ error: error.message }),
  user => res.json(user)
);
```

## 📚 Referências

- [Either Pattern em TypeScript](https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja)
- [Functional Error Handling](https://blog.logrocket.com/functional-error-handling-with-either-type-typescript/)
- [Clean Architecture Error Handling](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)