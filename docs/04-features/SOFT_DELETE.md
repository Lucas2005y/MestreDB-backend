# Proteções de Soft Delete

## Resumo

Quando um usuário deleta sua própria conta (soft delete), ele fica completamente bloqueado de acessar o sistema.

## Proteções Implementadas

### 0. Superusuários Não Podem Se Auto-Deletar
**Arquivo**: `src/presentation/controllers/UserController.ts`

```typescript
// Superusuários não podem deletar suas próprias contas
if (isSuperUser) {
  res.status(403).json({
    success: false,
    error: 'Superusuários não podem deletar suas próprias contas',
    message: 'Por segurança, contas de superusuário devem ser gerenciadas por outros administradores'
  });
  return;
}
```

- DELETE `/api/usuarios/me` bloqueado para superusuários
- Status 403 (Forbidden)
- Mensagem: "Por segurança, contas de superusuário devem ser gerenciadas por outros administradores"
- **Motivo**: Evita que o sistema fique sem administradores

### 1. Login Bloqueado
**Arquivo**: `src/application/usecases/AuthUseCases.ts`

```typescript
// Verificar se a conta foi deletada (soft delete)
if (user.deleted_at) {
  throw new Error('Esta conta foi desativada');
}
```

- Usuário não consegue fazer login
- Mensagem: "Esta conta foi desativada"

### 2. Refresh Token Bloqueado
**Arquivo**: `src/application/usecases/AuthUseCases.ts`

```typescript
// Verificar se a conta foi deletada (soft delete)
if (user.deleted_at) {
  throw new Error('Esta conta foi desativada');
}
```

- Não pode renovar tokens de acesso
- Sessões existentes são invalidadas no próximo refresh

### 3. Middleware de Autenticação
**Arquivo**: `src/presentation/middlewares/authMiddleware.ts`

```typescript
// Verificar se o usuário ainda existe e não foi deletado
const user = await userRepository.findOne({
  where: { id: decoded.userId },
  withDeleted: true
});

if (user.deleted_at) {
  res.status(401).json({
    error: 'Conta desativada',
    message: 'Esta conta foi desativada e não pode mais ser acessada'
  });
  return;
}
```

- Valida em TODA requisição autenticada
- Bloqueia acesso mesmo com token válido
- Status 401 com mensagem clara

### 4. Visualização de Perfil Bloqueada
**Arquivo**: `src/application/usecases/UserUseCases.ts`

```typescript
// Verificar se a conta foi deletada
if (user.deleted_at) {
  return null;
}
```

- GET `/api/usuarios/me` retorna 404
- GET `/api/usuarios/:id` retorna 404 para contas deletadas

### 5. Atualização de Perfil Bloqueada
**Arquivo**: `src/application/usecases/UserUseCases.ts`

```typescript
// Verificar se a conta foi deletada
if (existingUser.deleted_at) {
  throw new Error('Não é possível atualizar uma conta desativada');
}
```

- PUT `/api/usuarios/me` retorna erro
- PUT `/api/usuarios/:id` retorna erro
- Mensagem: "Não é possível atualizar uma conta desativada"

### 6. Deleção Duplicada Bloqueada
**Arquivo**: `src/application/usecases/UserUseCases.ts`

```typescript
// Verificar se a conta já foi deletada
if (existingUser.deleted_at) {
  throw new Error('Esta conta já foi desativada');
}
```

- DELETE `/api/usuarios/me` retorna erro se já deletada
- DELETE `/api/usuarios/:id` retorna erro se já deletada
- Mensagem: "Esta conta já foi desativada"

## Fluxo de Bloqueio

### Usuário Normal
```
Usuário deleta conta (soft delete)
         ↓
   deleted_at = NOW()
         ↓
┌─────────────────────────────┐
│  TODAS AS AÇÕES BLOQUEADAS  │
├─────────────────────────────┤
│ ❌ Login                    │
│ ❌ Refresh Token            │
│ ❌ Ver perfil               │
│ ❌ Atualizar dados          │
│ ❌ Deletar novamente        │
│ ❌ Qualquer endpoint auth   │
└─────────────────────────────┘
         ↓
   Apenas admin pode:
   ✅ Restaurar conta
   ✅ Deletar permanentemente
```

### Superusuário
```
Superusuário tenta deletar própria conta
         ↓
DELETE /api/usuarios/me
         ↓
┌─────────────────────────────┐
│      ❌ BLOQUEADO           │
├─────────────────────────────┤
│ Status: 403 Forbidden       │
│ Mensagem: "Superusuários    │
│ não podem deletar suas      │
│ próprias contas"            │
└─────────────────────────────┘
         ↓
   Outro superusuário pode:
   ✅ Deletar via DELETE /api/usuarios/:id
   ✅ Restaurar se deletado
   ✅ Deletar permanentemente
```

## Endpoints Afetados

### Bloqueados para Usuário Deletado
- `POST /api/auth/login` - Login bloqueado
- `POST /api/auth/refresh` - Refresh bloqueado
- `GET /api/auth/me` - Retorna 401
- `GET /api/usuarios/me` - Retorna 404
- `PUT /api/usuarios/me` - Retorna erro
- `DELETE /api/usuarios/me` - Retorna erro
- `GET /api/usuarios/:id` - Retorna 404
- `PUT /api/usuarios/:id` - Retorna erro
- `DELETE /api/usuarios/:id` - Retorna erro

### Bloqueados para Superusuário (Auto-Deleção)
- `DELETE /api/usuarios/me` - Bloqueado (403 Forbidden)
  - Superusuários não podem deletar suas próprias contas
  - Devem ser gerenciados por outros administradores

### Disponíveis para Admin
- `GET /api/usuarios/deleted` - Listar deletados
- `POST /api/usuarios/:id/restore` - Restaurar
- `DELETE /api/usuarios/:id/permanent?confirm=true` - Deletar permanentemente

## Mensagens de Erro

| Situação | Status | Mensagem |
|----------|--------|----------|
| Login com conta deletada | 401 | "Esta conta foi desativada" |
| Refresh com conta deletada | 401 | "Esta conta foi desativada" |
| Middleware detecta conta deletada | 401 | "Esta conta foi desativada e não pode mais ser acessada" |
| Tentar atualizar conta deletada | 400 | "Não é possível atualizar uma conta desativada" |
| Tentar deletar conta já deletada | 400 | "Esta conta já foi desativada" |
| Ver perfil de conta deletada | 404 | "Usuário não encontrado" |
| Superusuário tenta deletar própria conta | 403 | "Superusuários não podem deletar suas próprias contas" |

## Testes Recomendados

1. **Teste de Login**
   - Deletar conta
   - Tentar fazer login
   - Verificar erro "Esta conta foi desativada"

2. **Teste de Token Existente**
   - Fazer login
   - Deletar conta
   - Tentar usar token existente
   - Verificar bloqueio no middleware

3. **Teste de Refresh**
   - Fazer login
   - Deletar conta
   - Tentar refresh token
   - Verificar erro

4. **Teste de Operações**
   - Deletar conta
   - Tentar GET /api/usuarios/me → 404
   - Tentar PUT /api/usuarios/me → erro
   - Tentar DELETE /api/usuarios/me → erro

5. **Teste de Restauração**
   - Admin restaura conta
   - Usuário consegue fazer login novamente
   - Todas as operações funcionam normalmente

6. **Teste de Superusuário**
   - Login como superusuário
   - Tentar DELETE /api/usuarios/me
   - Verificar erro 403 "Superusuários não podem deletar suas próprias contas"
   - Outro superusuário pode deletar via DELETE /api/usuarios/:id
