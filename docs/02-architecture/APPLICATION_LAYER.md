# 🔧 Application Layer - Camada de Aplicação

## 📋 Visão Geral

A **Application Layer** contém os casos de uso e lógica de aplicação.

**Localização:** `src/application/`

---

## 📁 Estrutura

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

---

## 🎯 Use Cases

### UserUseCases

```typescript
// src/application/usecases/UserUseCases.ts
export class UserUseCases {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: PasswordService
  ) {}

  async createUser(userData: CreateUserDTO): Promise<UserResponseDTO> {
    // 1. Validar entrada
    const errors = await validate(userData);
    if (errors.length > 0) {
      throw new ValidationError('Dados inválidos', errors);
    }

    // 2. Regra de negócio: email único
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // 3. Criptografar senha
    const hashedPassword = await this.passwordService.hashPassword(userData.password);

    // 4. Criar usuário
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // 5. Retornar DTO
    return this.mapToResponseDTO(user);
  }
}
```

**Responsabilidades:**
- Orquestrar fluxos de negócio
- Aplicar regras de negócio
- Coordenar entre serviços
- Gerenciar transações

---

## 🛠️ Services

### PasswordService

```typescript
// src/application/services/PasswordService.ts
export class PasswordService {
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
```

### TokenService

```typescript
// src/application/services/TokenService.ts
export class TokenService {
  generateTokenPair(userData: UserTokenData): TokenPair {
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '1h'
    });

    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: '7d'
    });

    return { accessToken, refreshToken };
  }
}
```

---

## 📦 DTOs (Data Transfer Objects)

### CreateUserDTO

```typescript
// src/application/dtos/UserDTO.ts
export class CreateUserDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsBoolean()
  is_superuser?: boolean;
}
```

**Responsabilidades:**
- Transferir dados entre camadas
- Validar entrada
- Transformar dados

---

## ✅ Regras da Application Layer

### PODE fazer:
✅ Usar interfaces do Domain
✅ Orquestrar casos de uso
✅ Validar dados
✅ Transformar DTOs

### NÃO PODE fazer:
❌ Conhecer detalhes de HTTP
❌ Conhecer detalhes de banco
❌ Importar controllers
❌ Importar repositories concretos

---

## 📚 Referências

- [Domain Layer](./DOMAIN_LAYER.md)
- [Infrastructure Layer](./INFRASTRUCTURE_LAYER.md)
- [Guia Completo](../../CleanArchitectureGuide/01-Estruturacao-Clean-Architecture.md)
