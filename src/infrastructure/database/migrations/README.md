# 🔄 Migrations do TypeORM

Esta pasta contém as migrations do banco de dados do MestreDB Backend.

---

## 📋 Migrations Existentes

### 1732636800000-CreateUsersTable.ts ✅
**Data:** 2024-11-26
**Descrição:** Migration inicial que cria a tabela `users`

**O que faz:**
- Cria tabela `users` com todos os campos
- Adiciona índice em `is_superuser`
- Inclui comentários em cada campo

**Campos criados:**
- `id` - BIGINT AUTO_INCREMENT (PK)
- `name` - VARCHAR(80)
- `email` - VARCHAR(254) UNIQUE
- `password` - VARCHAR(128)
- `is_superuser` - BOOLEAN (default: false)
- `last_login` - DATETIME (nullable)
- `last_access` - DATETIME
- `created_at` - DATETIME
- `updated_at` - DATETIME

---

## 🛠️ Comandos Rápidos

```bash
# Ver status das migrations
npm run migration:show

# Aplicar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Criar nova migration
npm run migration:create -- src/infrastructure/database/migrations/NomeDaMigration

# Gerar migration automaticamente
npm run migration:generate -- NomeDaMigration
```

---

## 📚 Documentação Completa

Para informações detalhadas sobre como criar e usar migrations, consulte:

- **Guia Completo:** `docs/06-migrations/MIGRATIONS_GUIDE.md`
- **Referência Rápida:** `docs/06-migrations/QUICK_REFERENCE.md`
- **Exemplos:** `docs/06-migrations/MIGRATION_EXAMPLES.md`

---

## 🎯 Como Criar Nova Migration

### Método 1: Gerar Automaticamente (Recomendado)

```bash
# 1. Modificar entidade
# src/domain/entities/User.ts
@Column({ nullable: true })
phone?: string;

# 2. Gerar migration
npm run migration:generate -- AddPhoneToUsers

# 3. Revisar migration gerada
# 4. Aplicar
npm run migration:run
```

### Método 2: Criar Manualmente

```bash
# 1. Criar arquivo
npm run migration:create -- src/infrastructure/database/migrations/AddPhoneToUsers

# 2. Implementar up() e down()
# 3. Aplicar
npm run migration:run
```

---

## ⚠️ Regras Importantes

1. ✅ **SEMPRE** implementar método `down()` (rollback)
2. ✅ **SEMPRE** testar antes de commitar
3. ✅ **NUNCA** editar migration já aplicada
4. ✅ **SEMPRE** usar nomes descritivos
5. ✅ **SEMPRE** commitar migration com código

---

## 🔍 Ver Migrations Aplicadas

```bash
npm run migration:show
```

**Saída esperada:**
```
[X] CreateUsersTable1732636800000        (aplicada)
[ ] AddPhoneToUsers1732637000000         (pendente)
```

---

## 📖 Exemplo de Migration

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneToUsers1732637000000 implements MigrationInterface {
  name = 'AddPhoneToUsers1732637000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Telefone do usuário',
      }),
    );
    console.log('✅ Campo phone adicionado');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
    console.log('✅ Campo phone removido');
  }
}
```

---

## 🐛 Problemas Comuns

### Migration não aparece
```bash
# Verificar se está na pasta correta
ls src/infrastructure/database/migrations/
```

### Erro "already executed"
```bash
npm run migration:show
npm run migration:revert
```

### Erro "table already exists"
```bash
# Desenvolvimento: dropar e recriar
npm run schema:drop
npm run migration:run
```

---

**Última atualização:** 2024-11-26
