# 👥 User Endpoints - Usuários

## 📋 Endpoints de Usuários

Base URL: `/api/usuarios`

**Nota:** Todos os endpoints requerem autenticação (Bearer Token)

---

## GET /api/usuarios/me

Ver próprio perfil.

### Request

**Headers:**
```
Authorization: Bearer <token>
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "is_superuser": false,
    "last_access": "2025-01-10T...",
    "last_login": "2025-01-10T...",
    "created_at": "2025-01-10T...",
    "updated_at": "2025-01-10T..."
  }
}
```

---

## PUT /api/usuarios/me

Atualizar próprio perfil.

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Novo Nome",
  "email": "novoemail@example.com",
  "password": "novasenha123"
}
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "data": {
    "id": 1,
    "name": "Novo Nome",
    "email": "novoemail@example.com",
    "is_superuser": false
  }
}
```

---

## POST /api/usuarios

Criar novo usuário (apenas superusuário).

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "is_superuser": false
}
```

### Response

**Success (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 3,
    "name": "Maria Santos",
    "email": "maria@example.com",
    "is_superuser": false
  }
}
```

**Error (403):**
```json
{
  "error": "Acesso negado",
  "message": "Apenas super usuários podem criar usuários"
}
```

---

## GET /api/usuarios

Listar usuários com paginação (apenas superusuário).

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máx: 100)

**Exemplo:**
```
GET /api/usuarios?page=1&limit=10
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Administrador",
        "email": "admin@mestredb.com",
        "is_superuser": true,
        "last_access": "2025-01-10T...",
        "created_at": "2025-01-10T..."
      },
      {
        "id": 2,
        "name": "João Silva",
        "email": "joao@example.com",
        "is_superuser": false,
        "last_access": "2025-01-10T...",
        "created_at": "2025-01-10T..."
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

**Error (403):**
```json
{
  "error": "Acesso negado",
  "message": "Apenas super usuários podem listar usuários"
}
```

---

## GET /api/usuarios/:id

Buscar usuário por ID (próprio usuário ou superusuário).

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Exemplo:**
```
GET /api/usuarios/2
```

### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "João Silva",
    "email": "joao@example.com",
    "is_superuser": false,
    "last_access": "2025-01-10T...",
    "created_at": "2025-01-10T..."
  }
}
```

**Error (403):**
```json
{
  "error": "Acesso negado",
  "message": "Você só pode acessar seus próprios dados"
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

---

## PUT /api/usuarios/:id

Atualizar usuário por ID (próprio usuário ou superusuário).

### Request

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nome Atualizado",
  "email": "email@atualizado.com",
  "password": "novasenha123",
  "is_superuser": false
}
```

**Nota:** Apenas superusuários podem alterar `is_superuser`

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": {
    "id": 2,
    "name": "Nome Atualizado",
    "email": "email@atualizado.com",
    "is_superuser": false
  }
}
```

---

## DELETE /api/usuarios/:id

Deletar usuário por ID (próprio usuário ou superusuário).

### Request

**Headers:**
```
Authorization: Bearer <token>
```

**Exemplo:**
```
DELETE /api/usuarios/2
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Usuário deletado com sucesso"
}
```

**Error (403) - Superusuário tentando deletar própria conta:**
```json
{
  "error": "Operação não permitida",
  "message": "Você não pode deletar sua própria conta"
}
```

**Nota:** Superusuários não podem deletar suas próprias contas por segurança.

---

## 📊 Resumo de Permissões

| Endpoint | Usuário Normal | Superusuário |
|----------|----------------|--------------|
| GET /me | ✅ Próprio | ✅ Próprio |
| PUT /me | ✅ Próprio | ✅ Próprio |
| POST / | ❌ | ✅ |
| GET / | ❌ | ✅ |
| GET /:id | ✅ Próprio | ✅ Todos |
| PUT /:id | ✅ Próprio | ✅ Todos |
| DELETE /:id | ✅ Próprio | ✅ Todos (exceto próprio) |

---

## 📚 Referências

- [Auth Endpoints](./AUTH_ENDPOINTS.md)
- [User Management](../04-features/USER_MANAGEMENT.md)
- [API Overview](./API_OVERVIEW.md)
