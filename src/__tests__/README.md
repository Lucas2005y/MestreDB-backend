# 🧪 Testes Automatizados

Guia completo dos testes do MestreDB Backend.

---

## 📊 Estrutura

```
src/__tests__/
├── unit/                    # Testes unitários
│   ├── services/           # Testes de serviços
│   │   ├── PasswordService.test.ts
│   │   └── TokenService.test.ts
│   └── helpers/            # Testes de helpers
│       └── PaginationHelper.test.ts
├── integration/            # Testes de integração
│   ├── auth.test.ts       # Testes de autenticação
│   └── health.test.ts     # Testes de health check
├── mocks/                  # Mocks reutilizáveis
└── setup.ts               # Configuração global
```

---

## 🚀 Comandos

### Executar todos os testes
```bash
npm test
```

### Executar em modo watch
```bash
npm run test:watch
```

### Executar com cobertura
```bash
npm run test:coverage
```

### Executar testes específicos
```bash
# Apenas testes unitários
npm test -- unit

# Apenas testes de integração
npm test -- integration

# Arquivo específico
npm test -- PasswordService

# Teste específico
npm test -- -t "deve gerar hash da senha"
```

---

## 📝 Tipos de Testes

### 1. Testes Unitários

Testam unidades isoladas de código (funções, classes, métodos).

**Características:**
- Rápidos
- Isolados
- Sem dependências externas
- Usam mocks

**Exemplo:**
```typescript
describe('PasswordService', () => {
  it('deve gerar hash da senha', async () => {
    const password = 'MinhaSenh@123';
    const hash = await passwordService.hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
  });
});
```

### 2. Testes de Integração

Testam a integração entre componentes (rotas, controllers, use cases).

**Características:**
- Mais lentos
- Testam fluxo completo
- Podem usar banco de dados
- Testam API real

**Exemplo:**
```typescript
describe('POST /api/auth/login', () => {
  it('deve fazer login com credenciais válidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@mestredb.com', password: 'MinhaSenh@123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

---

## 🎯 Cobertura de Código

### Ver relatório
```bash
npm run test:coverage
```

### Abrir relatório HTML
```bash
# Windows
start coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

### Metas de Cobertura
- **Linhas:** 70%+
- **Funções:** 70%+
- **Branches:** 70%+
- **Statements:** 70%+

---

## ✅ Boas Práticas

### 1. Nomenclatura
```typescript
// ✅ Bom
describe('PasswordService', () => {
  describe('hashPassword', () => {
    it('deve gerar hash da senha', () => {});
    it('deve rejeitar senha vazia', () => {});
  });
});

// ❌ Ruim
describe('Test 1', () => {
  it('works', () => {});
});
```

### 2. Arrange-Act-Assert (AAA)
```typescript
it('deve validar senha forte', () => {
  // Arrange (Preparar)
  const password = 'MinhaSenh@123';

  // Act (Agir)
  const result = passwordService.validatePasswordStrength(password);

  // Assert (Verificar)
  expect(result).toBe(true);
});
```

### 3. Um conceito por teste
```typescript
// ✅ Bom - Testa uma coisa
it('deve retornar true para senha correta', () => {
  const isValid = await passwordService.comparePassword(password, hash);
  expect(isValid).toBe(true);
});

// ❌ Ruim - Testa várias coisas
it('deve validar senha', () => {
  expect(hash).toBeDefined();
  expect(isValid).toBe(true);
  expect(user).toHaveProperty('id');
});
```

### 4. Usar beforeEach para setup
```typescript
describe('TokenService', () => {
  let tokenService: TokenService;
  let mockUser: UserTokenData;

  beforeEach(() => {
    tokenService = new TokenService();
    mockUser = { id: 1, email: 'test@example.com' };
  });

  it('deve gerar token', () => {
    const token = tokenService.generateAccessToken(mockUser);
    expect(token).toBeDefined();
  });
});
```

### 5. Testar casos de erro
```typescript
it('deve rejeitar senha muito curta', () => {
  expect(() =>
    passwordService.validatePasswordStrength('123')
  ).toThrow('muito curta');
});
```

---

## 🔧 Configuração

### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    }
  }
};
```

### setup.ts
Configuração global executada antes de todos os testes.

---

## 🐛 Debugging

### Executar teste específico em debug
```bash
# Adicionar --inspect-brk
node --inspect-brk node_modules/.bin/jest PasswordService
```

### Usar console.log
```typescript
it('deve fazer algo', () => {
  console.log('Debug:', variavel);
  expect(variavel).toBe(valor);
});
```

### Usar debugger
```typescript
it('deve fazer algo', () => {
  debugger; // Pausa aqui
  expect(variavel).toBe(valor);
});
```

---

## 📚 Matchers Úteis

### Igualdade
```typescript
expect(value).toBe(expected);           // Igualdade estrita (===)
expect(value).toEqual(expected);        // Igualdade profunda
expect(value).not.toBe(expected);       // Negação
```

### Truthiness
```typescript
expect(value).toBeTruthy();             // Verdadeiro
expect(value).toBeFalsy();              // Falso
expect(value).toBeDefined();            // Definido
expect(value).toBeNull();               // Null
expect(value).toBeUndefined();          // Undefined
```

### Números
```typescript
expect(value).toBeGreaterThan(3);       // Maior que
expect(value).toBeGreaterThanOrEqual(3);// Maior ou igual
expect(value).toBeLessThan(5);          // Menor que
expect(value).toBeCloseTo(0.3);         // Próximo de (float)
```

### Strings
```typescript
expect(string).toMatch(/pattern/);      // Regex
expect(string).toContain('substring');  // Contém
```

### Arrays
```typescript
expect(array).toContain(item);          // Contém item
expect(array).toHaveLength(3);          // Tamanho
```

### Objetos
```typescript
expect(obj).toHaveProperty('key');      // Tem propriedade
expect(obj).toMatchObject({ key: val });// Match parcial
```

### Exceções
```typescript
expect(() => fn()).toThrow();           // Lança erro
expect(() => fn()).toThrow('message');  // Erro específico
```

### Assíncronos
```typescript
await expect(promise).resolves.toBe(value);  // Resolve
await expect(promise).rejects.toThrow();     // Rejeita
```

---

## 🎓 Exemplos Práticos

### Testar serviço
```typescript
describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('deve hashear senha', async () => {
    const hash = await service.hashPassword('senha123');
    expect(hash).toBeDefined();
    expect(hash).not.toBe('senha123');
  });
});
```

### Testar endpoint
```typescript
describe('GET /api/usuarios', () => {
  it('deve listar usuários', async () => {
    const response = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
  });
});
```

### Testar com mock
```typescript
describe('UserUseCases', () => {
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
    } as any;
  });

  it('deve buscar usuário', async () => {
    mockRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.getUserById(1);

    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockUser);
  });
});
```

---

## 🚨 Troubleshooting

### Testes falhando
1. Verificar se banco de dados está rodando
2. Verificar variáveis de ambiente (.env.test)
3. Limpar cache: `npm test -- --clearCache`

### Timeout
```typescript
// Aumentar timeout para teste específico
it('teste lento', async () => {
  // ...
}, 10000); // 10 segundos
```

### Banco de dados
```typescript
// Limpar banco antes dos testes
beforeAll(async () => {
  await AppDataSource.initialize();
  await AppDataSource.synchronize(true); // Drop + create
});

afterAll(async () => {
  await AppDataSource.destroy();
});
```

---

## 📖 Referências

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Última atualização:** 2025-01-18
