# 📖 API Reference - Visão Geral

## 🌐 Base URL

**Desenvolvimento:** `http://localhost:3000/api`
**Produção:** `https://api.mestredb.com/api`

---

## 🔐 Autenticação

Todos os endpoints protegidos requerem Bearer Token:

```
Authorization: Bearer <token>
```

---

## 📊 Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição do erro",
  "details": { ... }
}
```

---

## 📋 Status Codes

| Code | Significado |
|------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Não encontrado |
| 409 | Conflict - Conflito (ex: email já existe) |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error - Erro interno |

---

## 🔗 Endpoints

### Autenticação
- [POST /api/auth/register](./AUTH_ENDPOINTS.md#register)
- [POST /api/auth/login](./AUTH_ENDPOINTS.md#login)
- [POST /api/auth/refresh](./AUTH_ENDPOINTS.md#refresh)
- [POST /api/auth/logout](./AUTH_ENDPOINTS.md#logout)
- [GET /api/auth/me](./AUTH_ENDPOINTS.md#me)

### Usuários
- [GET /api/usuarios](./USER_ENDPOINTS.md#list)
- [POST /api/usuarios](./USER_ENDPOINTS.md#create)
- [GET /api/usuarios/:id](./USER_ENDPOINTS.md#get)
- [PUT /api/usuarios/:id](./USER_ENDPOINTS.md#update)
- [DELETE /api/usuarios/:id](./USER_ENDPOINTS.md#delete)
- [GET /api/usuarios/me](./USER_ENDPOINTS.md#me)
- [PUT /api/usuarios/me](./USER_ENDPOINTS.md#update-me)

---

## 🧪 Testando a API

### Swagger UI
http://localhost:3000/api-docs

### Postman
Importe: `MestreDB-API.postman_collection.json`

### curl
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mestredb.com","password":"MinhaSenh@123"}'
```

---

## 📚 Referências

- [Auth Endpoints](./AUTH_ENDPOINTS.md)
- [User Endpoints](./USER_ENDPOINTS.md)
- [Postman Guide](./POSTMAN.md)
