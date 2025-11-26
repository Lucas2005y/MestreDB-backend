# 🔄 Migrations do TypeORM - MestreDB Backend

Sistema completo de migrations implementado para controle versionado e seguro do schema do banco de dados.

---

## 📚 Documentação Disponível

### 1. **MIGRATIONS_GUIDE.md** - Guia Completo
Documentação detalhada sobre migrations incluindo:
- O que são migrations e por que usar
- Comandos disponíveis
- Como criar migrations (manual e automático)
- Fluxo de trabalho completo
- Exemplos práticos
- Boas práticas
- Troubleshooting

**Quando usar:** Primeira vez usando migrations ou precisa de referência completa.

### 2. **QUICK_REFERENCE.md** - Referência Rápida
Guia rápido para uso diário:
- Comandos essenciais
- Fluxo rápido
- Templates prontos
- Problemas comuns
- Checklist

**Quando usar:** Uso diário, consulta rápida de comandos.

### 3. **MIGRATION_EXAMPLES.md** - Exemplos Práticos
Coleção de exemplos prontos para copiar:
- Adicionar campos
- Remover campos
- Modificar campos
- Criar tabelas
- Adicionar índices
- Foreign keys
- Seeds de dados

**Quando usar:** Precisa criar uma migration específica.

---

## 🚀 Início Rápido

### Comandos Essenciais

```bash
# Ver status das migrations
npm run migration:show

# Aplicar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Gerar migration automaticamente
npm run migration:generate -- NomeDaMigration

# Criar migration manualmente
npm run migration:create -- src/infrastructure/database/migrations/NomeDaMigration
```

### Fluxo Básico

```bash
# 1. Modificar entidade
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

---

## 📁 Estrutura

```
docs/06-migrations/
├── README.md                    ← Você está aqui
├── MIGRATIONS_GUIDE.md          ← Guia completo
├── QUICK_REFERENCE.md           ← Referência rápida
└── MIGRATION_EXAMPLES.md        ← Exemplos práticos

src/infrastructure/database/
├── migrations/
│   ├── README.md                ← Guia da pasta
│   └── 1732636800000-CreateUsersTable.ts  ← Migration inicial
└── entities/
    └── User.ts

docs/09-roadmap/
└── IMPLEMENTATION_MIGRATIONS.md ← Documentação da implementação
```

---

## ✅ O Que Foi Implementado

### 1. Configuração
- ✅ `synchronize: false` ativado
- ✅ Scripts de migration no `package.json`
- ✅ Pasta de migrations configurada

### 2. Migration Inicial
- ✅ `CreateUsersTable` implementada
- ✅ Todos os campos da tabela users
- ✅ Índice em `is_superuser`
- ✅ Comentários em cada campo
- ✅ Método `down()` para rollback

### 3. Documentação
- ✅ Guia completo (MIGRATIONS_GUIDE.md)
- ✅ Referência rápida (QUICK_REFERENCE.md)
- ✅ Exemplos práticos (MIGRATION_EXAMPLES.md)
- ✅ Documentação de implementação
- ✅ READMEs nas pastas

---

## 🎯 Benefícios

### Segurança
- ✅ Sem alterações automáticas no banco
- ✅ Controle total sobre mudanças
- ✅ Rollback seguro
- ✅ Histórico completo

### Colaboração
- ✅ Migrations versionadas no Git
- ✅ Equipe sincronizada
- ✅ Fácil onboarding
- ✅ Documentação viva

### Produção
- ✅ Deploy seguro
- ✅ CI/CD automatizado
- ✅ Auditoria completa
- ✅ Conformidade

---

## 📖 Como Aprender

### 1. Iniciante
1. Ler `QUICK_REFERENCE.md` (5 min)
2. Executar comandos básicos
3. Ver migration existente

### 2. Intermediário
1. Ler `MIGRATIONS_GUIDE.md` (30 min)
2. Criar primeira migration
3. Testar rollback

### 3. Avançado
1. Estudar `MIGRATION_EXAMPLES.md`
2. Criar migrations complexas
3. Implementar seeds

---

## 🔗 Links Úteis

- **Guia Completo:** [MIGRATIONS_GUIDE.md](./MIGRATIONS_GUIDE.md)
- **Referência Rápida:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Exemplos:** [MIGRATION_EXAMPLES.md](./MIGRATION_EXAMPLES.md)
- **Implementação:** [../09-roadmap/IMPLEMENTATION_MIGRATIONS.md](../09-roadmap/IMPLEMENTATION_MIGRATIONS.md)
- **TypeORM Docs:** https://typeorm.io/migrations

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**Migration não aparece:**
```bash
ls src/infrastructure/database/migrations/
```

**Erro "already executed":**
```bash
npm run migration:show
npm run migration:revert
```

**Erro "table already exists":**
```bash
npm run schema:drop  # ⚠️ Cuidado em desenvolvimento
npm run migration:run
```

### Onde Buscar

1. **QUICK_REFERENCE.md** - Problemas comuns
2. **MIGRATIONS_GUIDE.md** - Troubleshooting completo
3. **MIGRATION_EXAMPLES.md** - Exemplos específicos

---

## 🎓 Próximos Passos

### Migrations Futuras Sugeridas

1. **AddPhoneToUsers** - Adicionar telefone
2. **CreateRefreshTokensTable** - Tabela de refresh tokens
3. **AddAvatarToUsers** - Avatar do usuário
4. **CreateAuditLogsTable** - Logs de auditoria
5. **AddSoftDeleteToUsers** - Soft delete

### Como Criar

```bash
# Quando precisar de nova tabela ou campo
npm run migration:generate -- NomeDaMudanca
npm run migration:run
```

---

**Implementado por:** Kiro AI
**Data:** 2024-11-26
**Versão:** 1.0.0
**Status:** ✅ Pronto para uso
