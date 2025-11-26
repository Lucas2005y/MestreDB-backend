# 📊 Schema do Banco de Dados

## 🗄️ Visão Geral

O MestreDB Backend usa **MySQL 8.0** com **TypeORM** como ORM.

---

## 📋 Tabelas

### users

Tabela principal de usuários do sistema.

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    last_login DATETIME NULL,
    last_access DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_is_superuser (is_superuser),
    INDEX idx_created_at (created_at)
);
```

**Campos:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | BIGINT | ID único (PK, auto-increment) |
| name | VARCHAR(80) | Nome do usuário |
| email | VARCHAR(254) | Email único |
| password | VARCHAR(128) | Senha criptografada (bcrypt) |
| is_superuser | BOOLEAN | Permissão de admin |
| last_login | DATETIME | Último login bem-sucedido |
| last_access | DATETIME | Último acesso ao sistema |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Data de atualização |

**Índices:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- INDEX: `email`, `is_superuser`, `created_at`

**Constraints:**
- `email` deve ser único
- `name` não pode ser nulo
- `password` não pode ser nulo

---

## 🔐 Dados Sensíveis

### Senha
- **Nunca** armazenada em texto plano
- Criptografada com **bcrypt** (12 salt rounds)
- Hash de 60 caracteres

### Email
- Único no sistema
- Validado no backend
- Usado para login

---

## 📈 Relacionamentos

Atualmente o sistema tem apenas a tabela `users`.

**Futuras expansões podem incluir:**
- `roles` - Papéis de usuário
- `permissions` - Permissões granulares
- `sessions` - Sessões ativas
- `audit_logs` - Logs de auditoria

---

## 🔍 Queries Comuns

### Buscar usuário por email
```sql
SELECT * FROM users WHERE email = 'admin@mestredb.com';
```

### Listar superusuários
```sql
SELECT id, name, email FROM users WHERE is_superuser = TRUE;
```

### Usuários criados hoje
```sql
SELECT * FROM users
WHERE DATE(created_at) = CURDATE();
```

### Usuários ativos (último acesso < 30 dias)
```sql
SELECT * FROM users
WHERE last_access >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

## 📊 Estatísticas

### Contar usuários
```sql
SELECT COUNT(*) as total FROM users;
```

### Contar por tipo
```sql
SELECT
    is_superuser,
    COUNT(*) as total
FROM users
GROUP BY is_superuser;
```

### Usuários mais recentes
```sql
SELECT name, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🛠️ Manutenção

### Backup
```bash
mysqldump -u root -p mestredb_sql > backup.sql
```

### Restore
```bash
mysql -u root -p mestredb_sql < backup.sql
```

### Otimizar tabela
```sql
OPTIMIZE TABLE users;
```

### Verificar integridade
```sql
CHECK TABLE users;
```

---

## 📚 Referências

- [Migrations](./MIGRATIONS.md)
- [Seeds](./SEEDS.md)
- [TypeORM Documentation](https://typeorm.io/)
