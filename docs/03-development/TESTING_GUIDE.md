# 🧪 Guia de Testes

## 📋 Tipos de Testes

### 1. Testes Unitários
Testam componentes isolados

### 2. Testes de Integração
Testam integração entre componentes

### 3. Testes E2E
Testam fluxo completo

---

## 🛠️ Comandos

```bash
npm test                 # Todos os testes
npm run test:watch       # Watch mode
npm run test:coverage    # Com coverage
```

---

## 📝 Exemplos

### Teste Unitário - Entity

```typescript
// src/__tests__/unit/domain/entities/User.test.ts
describe('User Entity', () => {
  it('should create a valid user', () => {
    const user = new User(
      1,
      'John Doe',
      'john@example.com',
      'hashedPassword',
      false,
      new Date(),
      new Date(),
      new Date()
    );

    expect(user.name).toBe('John Doe');
    expect(user.isAdmin()).toBe(false);
  });

  it('should throw error for invalid email', () => {
    expect(() => {
      new User(1, 'John', 'invalid-email', 'pass', false, new Date(), new Date(), new Date());
    }).toThrow('Email inválido');
  });
});
```

### Teste Unitário - Use Case

```typescript
// src/__tests__/unit/application/usecases/UserUseCases.test.ts
describe('UserUseCases', () => {
  let userUseCases: UserUseCases;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;

    mockPasswordService = {
      hashPassword: jest.fn(),
    } as any;

    userUseCases = new UserUseCases(mockRepository, mockPasswordService);
  });

  it('should create user successfully', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockPasswordService.hashPassword.mockResolvedValue('hashedPassword');
    mockRepository.create.mockResolvedValue(mockUser);

    const result = await userUseCases.createUser(userData);

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

### Teste de Integração

```typescript
// src/__tests__/integration/UserRepository.test.ts
describe('UserRepository Integration', () => {
  beforeAll(async () => {
    await TestDataSource.initialize();
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await TestDataSource.getRepository(User).clear();
  });

  it('should create and find user', async () => {
    const repository = new UserRepository();

    const created = await repository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      is_superuser: false
    });

    const found = await repository.findById(created.id);

    expect(found).toBeDefined();
    expect(found?.email).toBe('test@example.com');
  });
});
```

---

## 📊 Coverage

Objetivo: 80%+ de cobertura

```bash
npm run test:coverage

# Ver relatório
open coverage/lcov-report/index.html
```

---

## ✅ Boas Práticas

- ✅ Testar casos de sucesso e erro
- ✅ Usar mocks para dependências
- ✅ Limpar dados entre testes
- ✅ Nomes descritivos
- ✅ Arrange-Act-Assert pattern

---

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [Guia Completo](../../CleanArchitectureGuide/03-Guia-Implementacao-Primeiros-Testes.md)
