# 📚 Exemplos de Migrations

Coleção de exemplos práticos de migrations para o MestreDB Backend.

---

## 📋 Índice

1. [Adicionar Campos](#adicionar-campos)
2. [Remover Campos](#remover-campos)
3. [Modificar Campos](#modificar-campos)
4. [Criar Tabelas](#criar-tabelas)
5. [Adicionar Índices](#adicionar-índices)
6. [Foreign Keys](#foreign-keys)
7. [Dados Iniciais (Seeds)](#dados-iniciais-seeds)

---

## 1. Adicionar Campos

### Exemplo 1.1: Campo Simples (Telefone)

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
        comment: 'Telefone do usuário (formato: +55 11 99999-9999)',
      }),
    );
    console.log('✅ Campo phone adicionado à tabela users');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
    console.log('✅ Campo phone removido da tabela users');
  }
}
```

### Exemplo 1.2: Campo com Valor Padrão

```typescript
export class AddStatusToUsers1732637100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: ['active', 'inactive', 'suspended'],
        default: "'active'",
        isNullable: false,
        comment: 'Status da conta do usuário',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'status');
  }
}
```

### Exemplo 1.3: Múltiplos Campos

```typescript
export class AddProfileFieldsToUsers1732637200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'avatar_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'URL do avatar do usuário',
      }),
      new TableColumn({
        name: 'bio',
        type: 'text',
        isNullable: true,
        comment: 'Biografia do usuário',
      }),
      new TableColumn({
        name: 'birth_date',
        type: 'date',
        isNullable: true,
        comment: 'Data de nascimento',
      }),
    ]);
    console.log('✅ Campos de perfil adicionados');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', ['avatar_url', 'bio', 'birth_date']);
    console.log('✅ Campos de perfil removidos');
  }
}
```

---

## 2. Remover Campos

### Exemplo 2.1: Remover Campo Simples

```typescript
export class RemovePhoneFromUsers1732637300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaurar campo removido
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    );
  }
}
```

---

## 3. Modificar Campos

### Exemplo 3.1: Aumentar Tamanho do Campo

```typescript
export class IncreaseNameLength1732637400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`name\` VARCHAR(150) NOT NULL
      COMMENT 'Nome completo do usuário'
    `);
    console.log('✅ Tamanho do campo name aumentado para 150');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`name\` VARCHAR(80) NOT NULL
      COMMENT 'Nome completo do usuário'
    `);
    console.log('✅ Tamanho do campo name revertido para 80');
  }
}
```

### Exemplo 3.2: Tornar Campo Obrigatório

```typescript
export class MakePhoneRequired1732637500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primeiro, preencher valores NULL com valor padrão
    await queryRunner.query(`
      UPDATE \`users\`
      SET \`phone\` = '+55 00 00000-0000'
      WHERE \`phone\` IS NULL
    `);

    // Depois, tornar NOT NULL
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`phone\` VARCHAR(20) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`phone\` VARCHAR(20) NULL
    `);
  }
}
```

### Exemplo 3.3: Renomear Campo

```typescript
export class RenamePhoneToTelephone1732637600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'phone', 'telephone');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'telephone', 'phone');
  }
}
```

---

## 4. Criar Tabelas

### Exemplo 4.1: Tabela Simples (Posts)

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePostsTable1732637700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'published',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts', true);
  }
}
```

### Exemplo 4.2: Tabela com Foreign Key

```typescript
export class CreateRefreshTokensTable1732637800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '500',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expires_at',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'revoked_at',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_refresh_tokens_user',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('refresh_tokens', true);
  }
}
```

---

## 5. Adicionar Índices

### Exemplo 5.1: Índice Simples

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddEmailIndexToUsers1732637900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_email');
  }
}
```

### Exemplo 5.2: Índice Composto

```typescript
export class AddUserStatusIndex1732638000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_status_created',
        columnNames: ['status', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_status_created');
  }
}
```

### Exemplo 5.3: Índice Único

```typescript
export class AddUniquePhoneIndex1732638100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_phone_unique',
        columnNames: ['phone'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_phone_unique');
  }
}
```

---

## 6. Foreign Keys

### Exemplo 6.1: Adicionar Foreign Key

```typescript
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddUserForeignKeyToPosts1732638200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        name: 'FK_posts_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('posts', 'FK_posts_user');
  }
}
```

---

## 7. Dados Iniciais (Seeds)

### Exemplo 7.1: Criar Usuário Admin

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1732638300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('MinhaSenh@123', 12);
    const now = new Date();

    await queryRunner.query(`
      INSERT INTO \`users\`
      (\`name\`, \`email\`, \`password\`, \`is_superuser\`, \`last_access\`, \`created_at\`, \`updated_at\`)
      VALUES
      ('Administrador', 'admin@mestredb.com', '${password}', true, NOW(), NOW(), NOW())
    `);

    console.log('✅ Usuário admin criado');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`users\`
      WHERE \`email\` = 'admin@mestredb.com'
    `);

    console.log('✅ Usuário admin removido');
  }
}
```

### Exemplo 7.2: Seed de Múltiplos Registros

```typescript
export class SeedInitialUsers1732638400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('senha123', 12);

    const users = [
      { name: 'João Silva', email: 'joao@example.com' },
      { name: 'Maria Santos', email: 'maria@example.com' },
      { name: 'Pedro Oliveira', email: 'pedro@example.com' },
    ];

    for (const user of users) {
      await queryRunner.query(`
        INSERT INTO \`users\`
        (\`name\`, \`email\`, \`password\`, \`is_superuser\`, \`last_access\`)
        VALUES
        ('${user.name}', '${user.email}', '${password}', false, NOW())
      `);
    }

    console.log(`✅ ${users.length} usuários criados`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`users\`
      WHERE \`email\` IN ('joao@example.com', 'maria@example.com', 'pedro@example.com')
    `);
  }
}
```

---

## 🎯 Dicas Importantes

### 1. Sempre Testar Rollback

```bash
# Aplicar
npm run migration:run

# Reverter
npm run migration:revert

# Aplicar novamente
npm run migration:run
```

### 2. Usar Transações

```typescript
// QueryRunner já está em transação automática
// Se qualquer operação falhar, tudo é revertido
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.addColumn(...);
  await queryRunner.createIndex(...);
  // Tudo ou nada!
}
```

### 3. Comentários Úteis

```typescript
new TableColumn({
  name: 'phone',
  type: 'varchar',
  length: '20',
  comment: 'Telefone (formato: +55 11 99999-9999)', // ✅ Útil
})
```

### 4. Logs Informativos

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.addColumn(...);
  console.log('✅ Campo phone adicionado'); // ✅ Ajuda no debug
}
```

---

## 📚 Mais Recursos

- **Guia Completo:** `docs/06-migrations/MIGRATIONS_GUIDE.md`
- **Referência Rápida:** `docs/06-migrations/QUICK_REFERENCE.md`
- **Documentação TypeORM:** https://typeorm.io/migrations

---

**Última atualização:** 2024-11-26
