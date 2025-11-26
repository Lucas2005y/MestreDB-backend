# 🌱 Seeds - Dados Iniciais

## 📋 O que são Seeds?

Seeds são dados iniciais para popular o banco de dados:
- Usuário administrador padrão
- Dados de teste
- Configurações iniciais
- Dados de exemplo

---

## 🔐 Usuário Admin Padrão

O sistema cria automaticamente um usuário administrador na primeira execução.

### Configuração

```env
# .env.development
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=MinhaSenh@123
```

### Implementação

```typescript
// src/infrastructure/config/DatabaseInitializer.ts
private static async createDefaultAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mestredb.com';
  const existingAdmin = await userRepository.findByEmail(adminEmail);

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await userRepository.create({
      name: 'Administrador',
      email: adminEmail,
      password: hashedPassword,
      is_superuser: true
    });

    console.log('✅ Usuário administrador padrão criado');
  }
}
```

### Quando é Criado

O admin é criado automaticamente quando:
1. Aplicação inicia pela primeira vez
2. Banco está vazio (sem usuários)
3. Email do admin não existe

---

## 🛠️ Criando Seeds Customizados

### 1. Criar Script de Seed

```typescript
// src/infrastructure/database/seeds/UserSeeder.ts
import { AppDataSource } from '../config/database';
import { User } from '../database/entities/User';
import * as bcrypt from 'bcrypt';

export class UserSeeder {
  async run(): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);

    // Verificar se já existem usuários
    const count = await userRepository.count();
    if (count > 0) {
      console.log('⚠️  Usuários já existem, pulando seed');
      return;
    }

    // Criar usuários de teste
    const users = [
      {
        name: 'Admin',
        email: 'admin@mestredb.com',
        password: await bcrypt.hash('MinhaSenh@123', 12),
        is_superuser: true,
      },
      {
        name: 'João Silva',
        email: 'joao@example.com',
        password: await bcrypt.hash('senha123', 12),
        is_superuser: false,
      },
      {
        name: 'Maria Santos',
        email: 'maria@example.com',
        password: await bcrypt.hash('senha123', 12),
        is_superuser: false,
      },
    ];

    await userRepository.save(users);
    console.log('✅ Seeds de usuários criados');
  }
}
```

### 2. Executar Seed

```typescript
// src/infrastructure/database/seeds/index.ts
import { AppDataSource } from '../config/database';
import { UserSeeder } from './UserSeeder';

async function runSeeds() {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Executando seeds...');

    const userSeeder = new UserSeeder();
    await userSeeder.run();

    console.log('✅ Seeds executados com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  }
}

runSeeds();
```

### 3. Adicionar Script no package.json

```json
{
  "scripts": {
    "seed": "ts-node src/infrastructure/database/seeds/index.ts",
    "seed:dev": "NODE_ENV=development npm run seed",
    "seed:test": "NODE_ENV=test npm run seed"
  }
}
```

### 4. Executar

```bash
# Desenvolvimento
npm run seed:dev

# Teste
npm run seed:test
```

---

## 🎯 Boas Práticas

### ✅ FAZER:
- Verificar se dados já existem antes de criar
- Usar senhas criptografadas
- Criar dados realistas
- Documentar seeds criados
- Usar em ambiente de desenvolvimento/teste

### ❌ NÃO FAZER:
- Executar seeds em produção sem cuidado
- Usar senhas fracas mesmo em dev
- Criar dados sensíveis reais
- Sobrescrever dados existentes

---

## 📚 Exemplos de Seeds

### Seed de Configurações

```typescript
export class ConfigSeeder {
  async run(): Promise<void> {
    const configs = [
      { key: 'app_name', value: 'MestreDB' },
      { key: 'max_upload_size', value: '10MB' },
      { key: 'session_timeout', value: '3600' },
    ];

    await configRepository.save(configs);
  }
}
```

### Seed de Categorias

```typescript
export class CategorySeeder {
  async run(): Promise<void> {
    const categories = [
      { name: 'Tecnologia', slug: 'tecnologia' },
      { name: 'Negócios', slug: 'negocios' },
      { name: 'Educação', slug: 'educacao' },
    ];

    await categoryRepository.save(categories);
  }
}
```

---

## 🔄 Resetar Banco com Seeds

### Script Completo

```bash
#!/bin/bash
# scripts/reset-db.sh

echo "🗑️  Parando aplicação..."
npm run docker:down

echo "🧹 Limpando volumes..."
docker volume prune -f

echo "🐳 Iniciando Docker..."
npm run docker:up

echo "⏳ Aguardando MySQL..."
sleep 10

echo "🔄 Executando migrations..."
npm run migration:run

echo "🌱 Executando seeds..."
npm run seed:dev

echo "✅ Banco resetado com sucesso!"
```

### Uso

```bash
chmod +x scripts/reset-db.sh
./scripts/reset-db.sh
```

---

## 🧪 Seeds para Testes

### Seed Específico para Testes

```typescript
// src/__tests__/seeds/TestUserSeeder.ts
export class TestUserSeeder {
  async run(): Promise<void> {
    // Criar usuários específicos para testes
    const testUsers = [
      {
        name: 'Test Admin',
        email: 'test-admin@test.com',
        password: await bcrypt.hash('test123', 12),
        is_superuser: true,
      },
      {
        name: 'Test User',
        email: 'test-user@test.com',
        password: await bcrypt.hash('test123', 12),
        is_superuser: false,
      },
    ];

    await userRepository.save(testUsers);
  }
}
```

### Usar em Testes

```typescript
// src/__tests__/integration/setup.ts
beforeAll(async () => {
  await TestDataSource.initialize();
  const seeder = new TestUserSeeder();
  await seeder.run();
});

afterAll(async () => {
  await TestDataSource.destroy();
});
```

---

## 📚 Referências

- [Schema](./SCHEMA.md)
- [Migrations](./MIGRATIONS.md)
- [DatabaseInitializer.ts](../../src/infrastructure/config/DatabaseInitializer.ts)
