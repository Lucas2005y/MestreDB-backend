# 🔄 Guia de Migrations do TypeORM

**Data:** 2024-11-26
**Versão:** 1.0.0
**Status:** ✅ Implementado

---

## 📋 Índice

1. [O Que São Migrations](#o-que-são-migrations)
2. [Por Que Usar Migrations](#por-que-usar-migrations)
3. [Comandos Disponíveis](#comandos-disponíveis)
4. [Como Criar Migrations](#como-criar-migrations)
5. [Fluxo de Trabalho](#fluxo-de-trabalho)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Boas Práticas](#boas-práticas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 O Que São Migrations

Migrations são **arquivos versionados** que descrevem mudanças no schema do banco de dados de forma **controlada e reversível**.

### Analogia Simples

Pense em migrations como **"commits do Git para o banco de dados"**:

- Cada migration é um arquivo que descreve uma mudança
- Migrations são versionadas e ordenadas por timestamp
- Você pode aplicar (UP) ou reverter (DOWN) mudanças
- Histórico completo de todas as alterações no banco

### Estrutura de uma Migration

```typescript
export class NomeDaMigration1234567890 implements MigrationInterface {
  // O que fazer (aplicar mudança)
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela, adicionar coluna, etc.
  }

  // Como desfazer (reverter mudança)
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover tabela, remover coluna, etc.
  }
}
```

---

## 💡 Por Que Usar Migrations

### ❌ Sem Migrations (synchronize: true)

```typescript
// Configuração perigosa
synchronize: true // TypeORM altera banco automaticamente
```

**Problemas:**
- ❌ Pode deletar dados acidentalmente
- ❌ Sem controle sobre mudanças
- ❌ Impossível fazer rollback
- ❌ Sem histórico de alterações
- ❌ Perigoso em produção
- ❌ Difícil colaboração em equipe

### ✅ Com Migrations

```typescript
// Configuração segura
synchronize: false // Usar migrations para controle
```

**Benefícios:**
- ✅ Controle total sobre mudanças
- ✅ Rollback seguro
- ✅ Histórico versionado (Git)
- ✅ Seguro em produção
- ✅ Colaboração facilitada
- ✅ CI/CD automatizado
- ✅ Auditoria completa

---

## 🛠️ Comandos Disponíveis

### Criar Nova Migration (Manual)

```bash
npm run migration:create -- src/infrastructure/database/migrations/NomeDaMigration
```

**Quando usar:** Quando você quer escrever a migration manualmente.

**Exemplo:**
```bash
npm run migration:create -- src/infrastructure/database/migrations/AddPhoneToUsers
```

### Gerar Migration Automaticamente

```bash
npm run migration:generate -- NomeDaMigration
```

**Quando usar:** Quando você modificou entidades e quer que o TypeORM gere a migration automaticamente.

**Exemplo:**
```bash
# 1. Modificar entidade User (adicionar campo phone)
# 2. Gerar migration
npm run migration:generate -- AddPhoneToUsers
```

### Aplicar Migrations Pendentes

```bash
npm run migration:run
```

**O que faz:**
- Verifica quais migrations ainda não foram aplicadas
- Executa o método `up()` de cada uma em ordem
- Registra na tabela `migrations` do banco

**Saída esperada:**
```
query: SELECT * FROM `migrations` `migrations`
query: CREATE TABLE `users` ...
✅ Tabela users criada com sucesso
Migration CreateUsersTable1732636800000 has been executed successfully.
```

### Reverter Última Migration

```bash
npm run migration:revert
```

**O que faz:**
- Reverte a última migration aplicada
- Executa o método `down()`
- Remove registro da tabela `migrations`

**Saída esperada:**
```
query: SELECT * FROM `migrations` `migrations` ORDER BY `id` DESC
query: DROP TABLE `users`
✅ Tabela users removida com sucesso
Migration CreateUsersTable1732636800000 has been reverted successfully.
```

### Ver Migrations Aplicadas

```bash
npm run migration:show
```

**Saída esperada:**
```
[X] CreateUsersTable1732636800000
[X] AddPhoneToUsers1732637000000
[ ] AddAvatarToUsers1732638000000  (pending)
```

### Sincronizar Schema (Desenvolvimento)

```bash
npm run schema:sync
```

**⚠️ CUIDADO:** Sincroniza schema automaticamente. Use apenas em desenvolvimento!

### Dropar Schema Completo

```bash
npm run schema:drop
```

**⚠️ PERIGO:** Remove TODAS as tabelas! Use com extremo cuidado!

---

## 📝 Como Criar Migrations

### Método 1: Criar Manualmente

**Quando usar:** Mudanças complexas ou específicas.

```bash
npm run migration:create -- src/infrastructure/database/migrations/AddPhoneToUsers
```

**Arquivo gerado:**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToUsers1732637000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Escrever SQL ou usar QueryRunner
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter mudanças
  }
}
```

**Implementar:**
```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhoneToUsers1732637000000 implements MigrationInterface {
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
    console.log('✅ Coluna phone adicionada');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone');
    console.log('✅ Coluna phone removida');
  }
}
```

### Método 2: Gerar Automaticamente

**Quando usar:** Mudanças simples baseadas em entidades.

**Passo 1:** Modificar entidade
```typescript
// src/domain/entities/User.ts
@Entity('users')
export class User {
  // ... campos existentes

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string; // ✅ Novo campo
}
```

**Passo 2:** Gerar migration
```bash
npm run migration:generate -- AddPhoneToUsers
```

**Passo 3:** Revisar migration gerada
```typescript
// TypeORM gera automaticamente baseado na diferença
export class AddPhoneToUsers1732637000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD \`phone\` varchar(20) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      DROP COLUMN \`phone\`
    `);
  }
}
```

**Passo 4:** Aplicar
```bash
npm run migration:run
```

---

## 🔄 Fluxo de Trabalho

### Desenvolvimento Local

```bash
# 1. Modificar entidade
# Editar src/domain/entities/User.ts

# 2. Gerar migration
npm run migration:generate -- DescricaoDaMudanca

# 3. Revisar migration gerada
# Verificar arquivo em src/infrastructure/database/migrations/

# 4. Aplicar migration
npm run migration:run

# 5. Testar
npm run dev

# 6. Se algo der errado, reverter
npm run migration:revert

# 7. Commitar tudo
git add .
git commit -m "feat: adicionar campo X ao usuário"
git push
```

### Colaboração em Equipe

**Dev A cria migration:**
```bash
# Dev A
git checkout -b feature/add-phone
# Modificar entidade
npm run migration:generate -- AddPhoneToUsers
npm run migration:run
git add .
git commit -m "feat: adicionar telefone ao usuário"
git push
```

**Dev B aplica migration:**
```bash
# Dev B
git checkout main
git pull
npm run migration:run  # ✅ Aplica automaticamente
npm run dev
```

### Deploy em Produção

**Opção 1: Manual**
```bash
# No servidor
git pull
npm run migration:run
npm run build
npm start
```

**Opção 2: CI/CD (Recomendado)**
```yaml
# .github/workflows/deploy.yml
- name: Run Migrations
  run: npm run migration:run

- name: Build
  run: npm run build

- name: Deploy
  run: npm start
```

---

## 📚 Exemplos Práticos

### Exemplo 1: Adicionar Coluna

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAvatarToUsers1732638000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
        comment: 'URL do avatar do usuário',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'avatar_url');
  }
}
```

### Exemplo 2: Criar Nova Tabela

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRefreshTokensTable1732639000000 implements MigrationInterface {
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
          },
          {
            name: 'expires_at',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
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

### Exemplo 3: Adicionar Índice

```typescript
import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddEmailIndexToUsers1732640000000 implements MigrationInterface {
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

### Exemplo 4: Modificar Coluna

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class IncreaseNameLength1732641000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`name\` VARCHAR(150) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      MODIFY COLUMN \`name\` VARCHAR(80) NOT NULL
    `);
  }
}
```

### Exemplo 5: Adicionar Dados (Seed)

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1732642000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const password = await bcrypt.hash('MinhaSenh@123', 12);

    await queryRunner.query(`
      INSERT INTO \`users\`
      (\`name\`, \`email\`, \`password\`, \`is_superuser\`, \`last_access\`)
      VALUES
      ('Administrador', 'admin@mestredb.com', '${password}', true, NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`users\`
      WHERE \`email\` = 'admin@mestredb.com'
    `);
  }
}
```

---

## ✅ Boas Práticas

### 1. Nomenclatura Clara

```bash
# ✅ Bom
npm run migration:generate -- AddPhoneToUsers
npm run migration:generate -- CreateRefreshTokensTable
npm run migration:generate -- AddEmailIndexToUsers

# ❌ Ruim
npm run migration:generate -- Update
npm run migration:generate -- Fix
npm run migration:generate -- Changes
```

### 2. Uma Mudança Por Migration

```typescript
// ✅ Bom - Uma responsabilidade
export class AddPhoneToUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', ...);
  }
}

// ❌ Ruim - Múltiplas responsabilidades
export class UpdateUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', ...);
    await queryRunner.createTable('posts', ...);
    await queryRunner.addColumn('comments', ...);
  }
}
```

### 3. Sempre Implementar down()

```typescript
// ✅ Bom - Reversível
export class AddPhoneToUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', ...);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'phone'); // ✅ Pode reverter
  }
}

// ❌ Ruim - Não reversível
export class AddPhoneToUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', ...);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Vazio - não pode reverter!
  }
}
```

### 4. Testar Antes de Commitar

```bash
# Aplicar
npm run migration:run

# Testar aplicação
npm run dev
# Testar endpoints
# Verificar dados

# Reverter
npm run migration:revert

# Aplicar novamente
npm run migration:run

# Se tudo OK, commitar
git add .
git commit -m "feat: adicionar campo phone"
```

### 5. Nunca Editar Migrations Aplicadas

```bash
# ❌ NUNCA faça isso
# Editar migration que já foi aplicada em produção

# ✅ Faça isso
# Criar nova migration para corrigir
npm run migration:create -- FixPhoneColumn
```

### 6. Usar Transações

```typescript
// ✅ Bom - Usa transação automática
export class AddPhoneToUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // QueryRunner já está em transação
    await queryRunner.addColumn('users', ...);
    await queryRunner.createIndex('users', ...);
    // Se qualquer operação falhar, tudo é revertido
  }
}
```

### 7. Adicionar Comentários

```typescript
export class AddPhoneToUsers implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
        comment: 'Telefone do usuário (formato: +55 11 99999-9999)', // ✅ Comentário útil
      }),
    );
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "Migration has already been executed"

**Problema:** Tentando aplicar migration que já foi executada.

**Solução:**
```bash
# Ver migrations aplicadas
npm run migration:show

# Se necessário, reverter
npm run migration:revert
```

### Erro: "Table already exists"

**Problema:** Tabela já existe no banco.

**Solução 1:** Usar `ifNotExists`
```typescript
await queryRunner.createTable(
  new Table({ name: 'users', ... }),
  true, // ifNotExists = true
);
```

**Solução 2:** Dropar e recriar (desenvolvimento)
```bash
npm run schema:drop
npm run migration:run
```

### Erro: "Cannot find module"

**Problema:** TypeScript não compilou migrations.

**Solução:**
```bash
npm run build
npm run migration:run
```

### Migration Não Aparece

**Problema:** Migration não está sendo detectada.

**Verificar:**
1. Arquivo está em `src/infrastructure/database/migrations/`
2. Nome do arquivo segue padrão: `{timestamp}-{Nome}.ts`
3. Classe implementa `MigrationInterface`
4. Exportada corretamente

### Reverter Múltiplas Migrations

```bash
# Reverter última
npm run migration:revert

# Reverter mais uma
npm run migration:revert

# Ou dropar tudo e recriar (desenvolvimento)
npm run schema:drop
npm run migration:run
```

### Sincronizar com Produção

**Problema:** Desenvolvimento está diferente de produção.

**Solução:**
```bash
# 1. Backup do banco de produção
mysqldump -u root -p mestredb_sql > backup.sql

# 2. Restaurar localmente
mysql -u root -p mestredb_local < backup.sql

# 3. Gerar migrations baseadas na diferença
npm run migration:generate -- SyncWithProduction

# 4. Aplicar
npm run migration:run
```

---

## 📊 Tabela de Controle

O TypeORM cria automaticamente uma tabela `migrations` para controlar quais migrations foram aplicadas:

```sql
CREATE TABLE migrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  timestamp BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL
);
```

**Exemplo de dados:**
```
| id | timestamp     | name                              |
|----|---------------|-----------------------------------|
| 1  | 1732636800000 | CreateUsersTable1732636800000     |
| 2  | 1732637000000 | AddPhoneToUsers1732637000000      |
| 3  | 1732638000000 | AddAvatarToUsers1732638000000     |
```

**⚠️ NUNCA edite esta tabela manualmente!**

---

## 🎯 Checklist de Migration

Antes de commitar uma migration, verifique:

- [ ] Nome descritivo e claro
- [ ] Método `up()` implementado
- [ ] Método `down()` implementado (reversível)
- [ ] Testado localmente (aplicar e reverter)
- [ ] Comentários adicionados quando necessário
- [ ] Não quebra dados existentes
- [ ] Compatível com código atual
- [ ] Documentação atualizada (se necessário)

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [TypeORM Migrations](https://typeorm.io/migrations)
- [TypeORM QueryRunner](https://typeorm.io/query-runner)

### Exemplos no Projeto
- `src/infrastructure/database/migrations/1732636800000-CreateUsersTable.ts`

### Arquivos Relacionados
- `src/infrastructure/config/database.ts` - Configuração do TypeORM
- `package.json` - Scripts de migration
- `docs/06-migrations/MIGRATION_EXAMPLES.md` - Mais exemplos

---

**Última atualização:** 2024-11-26
**Autor:** Kiro AI
**Versão:** 1.0.0
