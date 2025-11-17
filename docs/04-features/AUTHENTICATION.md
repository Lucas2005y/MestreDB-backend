# 🔐 Autenticação e Autorização

## 📋 Sistema JWT

### Tokens

- **Access Token**: 1 hora de validade
- **Refresh Token**: 7 dias de validade
- **Formato**: Bearer Token

---

## 🔑 Endpoints

### POST /api/auth/register
Registro público de usuário

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "message": "Usuário registrado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": 2,
    "name": "João Silva",
    "email": "joao@example.com",
    "is_superuser": false
  }
}
```

### POST /api/auth/login
Login de usuário

**Request:**
```json
{
  "email": "admin@mestredb.com",
  "password": "MinhaSenh@123"
}
```

**Response:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

### POST /api/auth/refresh
Renovar access token

**Request:**
```json
{
  "refreshToken": "..."
}
```

### POST /api/auth/logout
Invalidar tokens (requer autenticação)

---

## 👥 Níveis de Permissão

### Usuário Normal
- Ver próprio perfil
- Editar próprio perfil
- Deletar própria conta

### Superusuário
- Todas as permissões de usuário normal
- Criar usuários
- Listar todos os usuários
- Editar qualquer usuário
- Deletar qualquer usuário (exceto própria conta)

---

## 🛡️ Middlewares

### authenticateToken
Valida JWT e injeta dados do usuário

### requireSuperUser
Requer permissão de superusuário

### requireOwnershipOrSuperUser
Requer ser o próprio usuário ou superusuário

---

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt (12 salt rounds)
- ✅ Tokens com expiração
- ✅ Blacklist de tokens no logout
- ✅ Rate limiting (5 tentativas/15min)
- ✅ Validação de entrada

---

## 📚 Referências

- [User Management](./USER_MANAGEMENT.md)
- [Security](./SECURITY.md)
- [API Endpoints](./API_ENDPOINTS.md)
