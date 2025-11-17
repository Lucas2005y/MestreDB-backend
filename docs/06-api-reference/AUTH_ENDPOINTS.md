# 🔐 Auth Endpoints - Autenticação

## 📋 Endpoints de Autenticação

Base URL: `/api/auth`

---

## POST /api/auth/register

Registro público de novo usuário.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

### Response

**Success (201):**
```json
{
  "message": "Usuário registrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "João Silva",
    "email": "joao@example.com",
    "is_superuser": false
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [...]
}
```

**Error (409):**
```json
{
  "success": false,
  "message": "Email já está em uso"
}
```

---

## POST /api/auth/login

Login de usuário existente.

### Request

**Body:**
```json
{
  "email": "admin@mestredb.com",
  "password": "MinhaSenh@123"
}
```

### Response

**Success (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@mestredb.com",
    "is_superuser": true
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Credenciais inválidas"
}
```

**Error (429):**
```json
{
  "success": false,
  "message": "Muitas tentativas. Tente novamente em 15 minutos."
}
```

**Rate Limiting:** 5 tentativas por 15 minutos por IP+email

---

## POST /api/auth/refresh

Renovar access token usando refresh token.

### Request

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response

**Success (200):**
```json
{
  "message": "Token renovado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Refresh token inválido ou expirado"
}
```

---

## POST /api/auth/logout

Invalidar tokens (logout).

### Request

**Headers:**
```
Authorization: Bearer <token>
```

### Response

**Success (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Error (401):**
```json
{
  "error": "Token requerido"
}
```

---

## GET /api/auth/me

Obter dados do usuário logado.

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
    "name": "Administrador",
    "email": "admin@mestredb.com",
    "is_superuser": true,
    "last_access": "2025-01-10T...",
    "created_at": "2025-01-10T..."
  }
}
```

**Error (401):**
```json
{
  "error": "Token inválido ou expirado"
}
```

---

## 📚 Referências

- [User Endpoints](./USER_ENDPOINTS.md)
- [Authentication](../04-features/AUTHENTICATION.md)
- [API Overview](./API_OVERVIEW.md)
