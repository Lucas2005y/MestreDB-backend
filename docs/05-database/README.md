# 🗄️ Database - MestreDB Backend

Documentação completa sobre o banco de dados do projeto.

---

## 📚 Documentação Disponível

### 1. **SCHEMA.md** - Estrutura do Banco
Documentação completa do schema do banco de dados:
- Tabelas e campos
- Tipos de dados
- Índices
- Relacionamentos
- Constraints

**Quando usar:** Entender estrutura do banco.

### 2. **SEEDS.md** - Dados Iniciais
Documentação sobre dados iniciais (seeds):
- Usuário admin padrão
- Dados de teste
- Como popular o banco

**Quando usar:** Configurar ambiente de desenvolvimento.

### 3. **migrations/** - Migrations do TypeORM
Documentação completa sobre migrations:
- Guia completo de uso
- Referência rápida
- Exemplos práticos
- Histórico de migrations

**Quando usar:** Criar ou aplicar mudanças no banco.

---

## 🚀 Início Rápido

### Ver Schema Atual

```bash
# Conectar ao MySQL
docker exec -it mestredb_mysql mysql -uroot -proot mestredb_sql

# Ver tabelas
SHOW TABLES;

# Ver estrutura da tabela users
DESCRIBE users;
```

### Aplicar Migrations

```bash
# Ver status
npm run migration:show

# Aplicar pendentes
npm run migration:run

# Reverter última
npm run migration:revert
```

### Popular com Dados Iniciais

```bash
# Usuário admin é criado automaticamente no primeiro start
npm run dev

# Ou via migration (se implementado)
npm run migration:run
```

---

## 📁 Estrutura

```
05-database/
├── README.md              ← Você está aqui
├── SCHEMA.md              ← Estrutura do banco
├── SEEDS.md               ← Dados iniciais
└── migrations/            ← Migrations do TypeORM
    ├── README.md
    ├── MIGRATIONS_GUIDE.md
    ├── QUICK_REFERENCE.md
    ├── MIGRATION_EXAMPLES.md
    └── IMPLEMENTATION_SUMMARY.md
```

---

## 🔗 Links Úteis

- **Schema:** [SCHEMA.md](./SCHEMA.md)
- **Seeds:** [SEEDS.md](./SEEDS.md)
- **Migrations:** [migrations/README.md](./migrations/README.md)
- **Guia de Migrations:** [migrations/MIGRATIONS_GUIDE.md](./migrations/MIGRATIONS_GUIDE.md)

---

## 📊 Tabelas Atuais

### users
Tabela principal de usuários do sistema.

**Campos:**
- `id` - BIGINT (PK)
- `name` - VARCHAR(80)
- `email` - VARCHAR(254) UNIQUE
- `password` - VARCHAR(128)
- `is_superuser` - BOOLEAN
- `last_login` - DATETIME
- `last_access` - DATETIME
- `created_at` - DATETIME
- `updated_at` - DATETIME

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE (`email`)
- INDEX (`is_superuser`)

---

## 🎯 Próximos Passos

### Para Iniciantes
1. Ler [SCHEMA.md](./SCHEMA.md)
2. Ver [SEEDS.md](./SEEDS.md)
3. Conectar ao banco e explorar

### Para Desenvolvedores
1. Ler [migrations/QUICK_REFERENCE.md](./migrations/QUICK_REFERENCE.md)
2. Aprender a criar migrations
3. Aplicar mudanças no banco

### Para Avançados
1. Estudar [migrations/MIGRATIONS_GUIDE.md](./migrations/MIGRATIONS_GUIDE.md)
2. Criar migrations complexas
3. Otimizar queries e índices

---

**Última atualização:** 2024-11-26
