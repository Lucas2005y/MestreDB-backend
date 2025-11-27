# Reutilização de Email Após Soft Delete

## Problema Original

Quando um usuário era deletado (soft delete), o email ficava "preso" no banco de dados devido ao índice único. Isso impedia que:
- O mesmo email fosse usado para criar uma nova conta
- O usuário pudesse se registrar novamente com o mesmo email

## Solução Implementada

### Migration: UpdateEmailUniqueIndex

**Arquivo**: `src/infrastructure/database/migrations/1764266378146-UpdateEmailUniqueIndex.ts`

A migration remove o índice único simples do email e cria um índice funcional que:
- Garante unicidade apenas para emails **não deletados** (deleted_at IS NULL)
- Permite múltiplos registros com o mesmo email se estiverem deletados
- Usa recursos do MySQL 8.0.13+ (índices funcionais)

### Índice Funcional

```sql
CREATE UNIQUE INDEX `IDX_users_email_not_deleted`
ON `users` (`email`, (CASE WHEN `deleted_at` IS NULL THEN 1 ELSE NULL END))
```

**Como funciona:**
- Para usuários ativos (deleted_at IS NULL): índice = (email, 1)
- Para usuários deletados (deleted_at NOT NULL): índice = (email, NULL)
- MySQL permite múltiplos valores NULL no índice único
- Portanto, múltiplos emails deletados são permitidos
- Mas apenas UM email ativo é permitido

## Cenários Suportados

### ✅ Cenário 1: Registro Normal
```
1. Usuário cria conta: joao@email.com
2. Email fica único no sistema
```

### ✅ Cenário 2: Soft Delete e Novo Registro
```
1. Usuário A cria conta: joao@email.com
2. Usuário A deleta sua conta (soft delete)
3. Usuário B pode criar conta com: joao@email.com
4. Sistema permite porque o primeiro está deletado
```

### ✅ Cenário 3: Múltiplos Deletados
```
1. Usuário A cria: joao@email.com → deleta
2. Usuário B cria: joao@email.com → deleta
3. Usuário C cria: joao@email.com → deleta
4. Todos os registros deletados coexistem
5. Usuário D pode criar: joao@email.com (ativo)
```

### ❌ Cenário 4: Duplicação Bloqueada
```
1. Usuário A cria: joao@email.com (ativo)
2. Usuário B tenta criar: joao@email.com
3. ❌ ERRO: Email já está em uso
4. Índice único impede duplicação
```

## Impacto nas Operações

### Registro (POST /api/auth/register)
- ✅ Permite registro com email de conta deletada
- ❌ Bloqueia registro com email de conta ativa
- Validação no código continua funcionando normalmente

### Restauração (POST /api/usuarios/:id/restore)
- ⚠️ Verifica se email já está em uso antes de restaurar
- Se email foi reutilizado, restauração falha com ConflictError
- Mensagem: "Email já está em uso por outro usuário"

### Login (POST /api/auth/login)
- ✅ Busca apenas usuários ativos (deleted_at IS NULL)
- ❌ Usuários deletados não conseguem fazer login
- Mesmo que email exista deletado, não interfere

## Queries do TypeORM

### Busca por Email (Usuários Ativos)
```sql
SELECT * FROM users
WHERE email = 'joao@email.com'
AND deleted_at IS NULL
```
Retorna apenas o usuário ativo, ignora deletados.

### Busca com Deletados
```sql
SELECT * FROM users
WHERE email = 'joao@email.com'
-- Inclui todos (ativos e deletados)
```
Usado apenas em operações administrativas.

## Requisitos Técnicos

### MySQL Version
- **Mínimo**: MySQL 8.0.13+
- **Motivo**: Suporte a índices funcionais (functional indexes)
- **Alternativa**: Para versões antigas, usar trigger ou coluna computada

### Verificar Versão
```sql
SELECT version();
```

Se versão < 8.0.13, a migration falhará.

## Rollback

Para reverter a migration:
```bash
npm run migration:revert
```

Isso:
1. Remove o índice funcional
2. Recria o índice único simples no email
3. ⚠️ Pode falhar se houver emails duplicados (deletados)

## Testes Recomendados

### Teste 1: Registro Após Soft Delete
```bash
# 1. Criar usuário
POST /api/auth/register
{ "email": "teste@email.com", "name": "Teste", "password": "Senha123" }

# 2. Deletar conta
DELETE /api/usuarios/me

# 3. Registrar novamente com mesmo email
POST /api/auth/register
{ "email": "teste@email.com", "name": "Teste 2", "password": "Senha456" }

# ✅ Deve funcionar
```

### Teste 2: Duplicação Bloqueada
```bash
# 1. Criar usuário A
POST /api/auth/register
{ "email": "teste@email.com", "name": "A", "password": "Senha123" }

# 2. Tentar criar usuário B com mesmo email
POST /api/auth/register
{ "email": "teste@email.com", "name": "B", "password": "Senha456" }

# ❌ Deve falhar: "Email já está em uso"
```

### Teste 3: Restauração com Conflito
```bash
# 1. Admin deleta usuário A (email: teste@email.com)
DELETE /api/usuarios/1

# 2. Novo usuário B registra com mesmo email
POST /api/auth/register
{ "email": "teste@email.com", "name": "B", "password": "Senha456" }

# 3. Admin tenta restaurar usuário A
POST /api/usuarios/1/restore

# ❌ Deve falhar: "Email já está em uso por outro usuário"
```

## Considerações de Segurança

### Auditoria
- Todos os registros deletados são mantidos no banco
- Histórico completo de quem usou cada email
- Logs de auditoria rastreiam criações e deleções

### GDPR / LGPD
- Soft delete mantém dados pessoais
- Para compliance total, usar hard delete após período
- Endpoint: `DELETE /api/usuarios/:id/permanent?confirm=true`

### Prevenção de Abuso
- Rate limiting no registro
- Validação de email
- Logs de tentativas de registro

## Documentação Relacionada

- [SOFT_DELETE.md](../04-features/SOFT_DELETE.md) - Proteções de soft delete
- [IMPROVEMENTS.md](../09-roadmap/IMPROVEMENTS.md) - Melhorias implementadas
- [SECURITY.md](../04-features/SECURITY.md) - Segurança geral
