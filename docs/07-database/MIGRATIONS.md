# 🔄 Migrations - Migrações de Banco

## 📋 O que são Migrations?

Migrations são versionamento de banco de dados. Permitem:
- Controlar mudanças no schema
- Aplicar mudanças de forma consistente
- Reverter mudanças se necessário
- Trabalhar em equipe sem conflitos

---

## 🛠️ Comandos

### Gerar Migration
```bash
# Gera migration baseada nas mudanças nas entities
npm run migration:generate -- NomeDaMigration

# Exemplo
npm run migration:generate -- CreateUsersTable
```

### Executar Migrations
```bash
# Executa todas as migrations pendentes
npm run migration:run
```

### Reverter Migration
```bash
# Reverte a última migration executada
npm run migration:revert
```

### Ver Status
```bash
# Ver migrations executadas e pendentes
npm run typeorm -- migration:show
```

---

## 📁 Localização

```
src/infrastructure/database/migrations/
├── 1234567890123-CreateUsersTable.ts
├── 1234567890124-AddLastAccessToUsers.ts
└── ...
```

**Formato:** `timestamp-NomeDaMigration.ts`

---

## 📝 Estrutura de uma Migration

```typescript
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1234567890123 implements MigrationInterface {
    name = 'CreateUsersTable1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Aplicar mudanças
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "bigint",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "80",
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "254",
                        isUnique: true,
                    },
                    // ... outros campos
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter mudanças
        await queryRunner.dropTable("users");
    }
}
```

---

## 🎯 Boas Práticas

### ✅ FAZER:
- Testar migration em desenvolvimento primeiro
- Fazer backup antes de executar em produção
- Escrever `down()` para reverter
- Usar nomes descritivos
- Commitar migrations no git

### ❌ NÃO FAZER:
- Editar migrations já executadas
- Deletar migrations antigas
- Executar migrations manualmente no banco
- Pular migrations

---

## 📚 Exemplos

### Adicionar Coluna
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("users", new TableColumn({
        name: "phone",
        type: "varchar",
        length: "20",
        isNullable: true,
    }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("users", "phone");
}
```

### Criar Índice
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex("users", new TableIndex({
        name: "IDX_USER_EMAIL",
        columnNames: ["email"]
    }));
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "IDX_USER_EMAIL");
}
```

### Alterar Coluna
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn("users", "name", new TableColumn({
        name: "name",
        type: "varchar",
        length: "100", // Aumentado de 80 para 100
    }));
}
```

---

## 🚀 Workflow de Produção

### 1. Desenvolvimento
```bash
# Fazer mudanças nas entities
# Gerar migration
npm run migration:generate -- MinhaAlteracao

# Testar
npm run migration:run
npm run migration:revert
npm run migration:run
```

### 2. Commit
```bash
git add src/infrastructure/database/migrations/
git commit -m "feat: add migration MinhaAlteracao"
```

### 3. Produção
```bash
# Fazer backup
mysqldump -u root -p mestredb_sql > backup_pre_migration.sql

# Executar migration
NODE_ENV=production npm run migration:run

# Verificar
# Se houver problema, reverter:
NODE_ENV=production npm run migration:revert
```

---

## 🐛 Troubleshooting

### Migration já executada
```
Error: Migration already executed
```
**Solução:** Não executar novamente. Se precisa refazer, reverta primeiro.

### Erro na migration
```
Error: Column already exists
```
**Solução:**
1. Reverter: `npm run migration:revert`
2. Corrigir migration
3. Executar novamente

### Migration não encontrada
```
Error: No migrations found
```
**Solução:** Verificar se o caminho está correto em `database.ts`

---

## 📚 Referências

- [Schema](./SCHEMA.md)
- [TypeORM Migrations](https://typeorm.io/migrations)
- [Development Guide](../03-development/DEVELOPMENT_GUIDE.md)
