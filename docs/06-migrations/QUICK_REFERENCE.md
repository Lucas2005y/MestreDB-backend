# 🚀 Migrations - Referência Rápida

Guia rápido para uso diário de migrations no MestreDB Backend.

---

## 📋 Comandos Essenciais

```bash
# Criar migration manualmente
npm run migration:create -- src/infrastructure/database/migrations/NomeDaMigration

# Gerar migration automaticamente (baseado em entidades)
npm run migration:generate -- NomeDaMigration

# Aplicar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Ver status das migrations
npm run migration:show
```

---

## 🔄 Fluxo Rápido

### Adicionar Novo Campo

```bash
# 1. Editar entidade
# src/domain/entities/User.ts
@Column({ nullable: true })
phone?: string;

# 2. Gerar migration
npm run migration:generate -- AddPhoneToUsers

# 3. Aplicar
npm run migration:run

# 4. Testar
npm run dev

# 5. Commitar
git add .
git commit -m "feat: adicionar telefone ao usuário"
```

### Criar Nova Tabela

```bash
# 1. Criar entidade
# src/domain/entities/Post.ts

# 2. Adicionar em database.ts
entities: [User, Post]

# 3. Gerar migration
npm run migration:generate -- CreatePostsTable

# 4. Aplicar
npm run migration:run
```

---

## 📝 Templates Rápidos

### Adicionar Coluna

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFieldToTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'table_name',
      new TableColumn({
        name: 'field_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('table_name', 'field_name');
  }
}
```

### Remover Coluna

```typescript
export class RemoveFieldFromTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('table_name', 'field_name');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'table_name',
      new TableColumn({
        name: 'field_name',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );
  }
}
```

### Adicionar Índice

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexToTable1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'table_name',
      new TableIndex({
        name: 'IDX_table_field',
        columnNames: ['field_name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('table_name', 'IDX_table_field');
  }
}
```

### Criar Tabela

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableName1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'table_name',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('table_name', true);
  }
}
```

---

## ⚠️ Regras de Ouro

1. ✅ **SEMPRE** implementar `down()`
2. ✅ **SEMPRE** testar antes de commitar
3. ✅ **NUNCA** editar migration já aplicada
4. ✅ **SEMPRE** usar nomes descritivos
5. ✅ **SEMPRE** commitar migration com código

---

## 🐛 Problemas Comuns

### Migration não aparece
```bash
# Verificar se está na pasta correta
ls src/infrastructure/database/migrations/

# Verificar formato do nome
# Deve ser: {timestamp}-{Nome}.ts
```

### Erro "already executed"
```bash
# Ver status
npm run migration:show

# Reverter se necessário
npm run migration:revert
```

### Erro "table already exists"
```bash
# Desenvolvimento: dropar e recriar
npm run schema:drop
npm run migration:run
```

---

## 📊 Status das Migrations

```bash
npm run migration:show
```

**Saída:**
```
[X] CreateUsersTable1732636800000        (executada)
[X] AddPhoneToUsers1732637000000         (executada)
[ ] AddAvatarToUsers1732638000000        (pendente)
```

---

## 🎯 Checklist Rápido

Antes de commitar:

- [ ] Migration criada
- [ ] `up()` implementado
- [ ] `down()` implementado
- [ ] Testado localmente
- [ ] `npm run migration:run` funcionou
- [ ] `npm run migration:revert` funcionou
- [ ] Código atualizado
- [ ] Testes passando

---

## 📚 Mais Informações

Ver documentação completa: `docs/06-migrations/MIGRATIONS_GUIDE.md`

---

**Última atualização:** 2024-11-26
