# 🔌 Infrastructure Layer

## 📋 Visão Geral

Implementações técnicas e integrações externas.

**Localização:** `src/infrastructure/`

---

## 📁 Estrutura

```
src/infrastructure/
├── repositories/          # Implementações
│   ├── UserRepository.ts
│   └── BaseRepository.ts
├── database/              # Banco de dados
│   ├── entities/         # TypeORM entities
│   └── migrations/       # Migrations
├── config/                # Configurações
│   ├── database.ts
│   ├── environment.ts
│   └── swagger.ts
└── web/                   # Web configs
    └── cors.ts
```

---

## 🗄️ Repositories

```typescript
// src/infrastructure/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  async create(userData: CreateUserData): Promise<User> {
    const entity = this.repository.create(userData);
    const saved = await this.repository.save(entity);
    return this.mapToDomain(saved);
  }

  private mapToDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.name,
      entity.email,
      // ...
    );
  }
}
```

**Responsabilidades:**
- Implementar interfaces do Domain
- Acessar banco de dados
- Mapear entidades

---

## ⚙️ Configurações

### Database

```typescript
// src/infrastructure/config/database.ts
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3307'),
  username: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  entities: [User],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
});
```

### Environment

```typescript
// src/infrastructure/config/environment.ts
export function loadEnvironment(): void {
  const env = process.env.NODE_ENV || 'development';
  const envFile = `.env.${env}`;
  dotenv.config({ path: envFile });
}
```

---

## ✅ Regras

### PODE:
✅ Implementar interfaces do Domain
✅ Usar frameworks (TypeORM, Express)
✅ Acessar recursos externos

### NÃO PODE:
❌ Conhecer Presentation Layer
❌ Conhecer Main Layer

---

## 📚 Referências

- [Domain Layer](./DOMAIN_LAYER.md)
- [Presentation Layer](./PRESENTATION_LAYER.md)
