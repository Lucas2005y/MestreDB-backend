# 🚀 Início Rápido - MestreDB Backend

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:
- ✅ [Instalado o projeto](./INSTALLATION.md)
- ✅ Docker rodando
- ✅ Aplicação iniciada (`npm run dev`)

---

## 🎯 Primeiros Passos (5 minutos)

### 1. Verificar se está Rodando

```bash
# Testar health check
curl http://localhost:3000/api/health

# Ou abra no navegador:
# http://localhost:3000/api/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2025-01-10T...",
  "environment": "development"
}
```

---

### 2. Acessar Documentação Swagger

Abra no navegador: **http://localhost:3000/api-docs**

Você verá a documentação interativa com todos os endpoints!

---

### 3. Fazer Login com Usuário Admin

**Usando curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mestredb.com",
    "password": "MinhaSenh@123"
  }'
```

**Usando Swagger:**
1. Acesse http://localhost:3000/api-docs
2. Encontre `POST /api/auth/login`
3. Clique em "Try it out"
4. Preencha:
   ```json
   {
     "email": "admin@mestredb.com",
     "password": "MinhaSenh@123"
   }
   ```
5. Clique em "Execute"

**Resposta:**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@mestredb.com",
    "is_superuser": true
  }
}
```

**Copie o `token`** - você vai precisar dele!

---

### 4. Testar Endpoint Protegido

**Usando curl:**
```bash
# Substitua YOUR_TOKEN pelo token que você copiou
curl -X GET http://localhost:3000/api/usuarios/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Usando Swagger:**
1. Clique no botão "Authorize" (cadeado) no topo
2. Cole o token: `Bearer YOUR_TOKEN`
3. Clique em "Authorize"
4. Agora você pode testar endpoints protegidos!

**Resposta:**
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

---

### 5. Criar um Novo Usuário

**Usando Swagger (mais fácil):**
1. Certifique-se de estar autenticado (passo 4)
2. Encontre `POST /api/usuarios`
3. Clique em "Try it out"
4. Preencha:
   ```json
   {
     "name": "João Silva",
     "email": "joao@example.com",
     "password": "senha123",
     "is_superuser": false
   }
   ```
5. Clique em "Execute"

**Usando curl:**
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "senha123",
    "is_superuser": false
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 2,
    "name": "João Silva",
    "email": "joao@example.com",
    "is_superuser": false
  }
}
```

---

### 6. Listar Todos os Usuários

```bash
curl -X GET "http://localhost:3000/api/usuarios?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Administrador",
        "email": "admin@mestredb.com",
        "is_superuser": true
      },
      {
        "id": 2,
        "name": "João Silva",
        "email": "joao@example.com",
        "is_superuser": false
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## 🎓 Conceitos Básicos

### Autenticação JWT

O sistema usa **JWT (JSON Web Tokens)** para autenticação:

- **Access Token**: Válido por 1 hora
- **Refresh Token**: Válido por 7 dias
- **Bearer Token**: Formato `Authorization: Bearer <token>`

### Permissões

Existem 2 níveis de acesso:

1. **Usuário Normal**
   - Pode ver e editar apenas seus próprios dados
   - Não pode criar outros usuários
   - Não pode listar todos os usuários

2. **Superusuário (Admin)**
   - Acesso total a todos os recursos
   - Pode criar, editar e deletar qualquer usuário
   - Pode listar todos os usuários

### Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| POST | `/api/auth/refresh` | Renovar token | ❌ |
| POST | `/api/auth/logout` | Fazer logout | ✅ |
| GET | `/api/usuarios/me` | Ver próprio perfil | ✅ |
| PUT | `/api/usuarios/me` | Editar próprio perfil | ✅ |
| POST | `/api/usuarios` | Criar usuário | ✅ Admin |
| GET | `/api/usuarios` | Listar usuários | ✅ Admin |
| GET | `/api/usuarios/:id` | Ver usuário | ✅ |
| PUT | `/api/usuarios/:id` | Editar usuário | ✅ |
| DELETE | `/api/usuarios/:id` | Deletar usuário | ✅ |

---

## 🛠️ Ferramentas Úteis

### 1. Postman

Importe a collection: `MestreDB-API.postman_collection.json`

```bash
# Arquivo está na raiz do projeto
# Importe no Postman: File > Import > MestreDB-API.postman_collection.json
```

### 2. phpMyAdmin

Acesse: **http://localhost:8080**

- Usuário: `root`
- Senha: `root`
- Database: `mestredb_sql`

### 3. VS Code REST Client

Crie arquivo `test.http`:

```http
### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@mestredb.com",
  "password": "MinhaSenh@123"
}

### Get Profile (substitua o token)
GET http://localhost:3000/api/usuarios/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📚 Próximos Passos

Agora que você testou a API:

1. 🏗️ [Entenda a Estrutura](./PROJECT_STRUCTURE.md) - Como o código está organizado
2. 🔧 [Guia de Desenvolvimento](../03-development/DEVELOPMENT_GUIDE.md) - Como desenvolver
3. 🧪 [Guia de Testes](../03-development/TESTING_GUIDE.md) - Como testar
4. 📖 [Documentação Completa](../README.md) - Explore tudo

---

## 🐛 Problemas Comuns

### Token Expirado

**Erro:** `Token expirado`

**Solução:** Faça login novamente ou use o refresh token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Permissão Negada

**Erro:** `Acesso negado`

**Solução:**
- Verifique se está usando o token correto
- Verifique se tem permissão para a operação
- Superusuários têm acesso total

### Servidor não responde

**Erro:** `Connection refused`

**Solução:**
```bash
# Verificar se está rodando
npm run dev

# Verificar porta
curl http://localhost:3000/api/health
```

---

## 💡 Dicas

### Desenvolvimento Rápido

```bash
# Terminal 1: Rodar aplicação
npm run dev

# Terminal 2: Rodar testes
npm run test:watch

# Terminal 3: Ver logs do Docker
npm run docker:logs
```

### Testar Rapidamente

Use Swagger UI - é mais rápido que curl!
- http://localhost:3000/api-docs

### Resetar Banco

```bash
# Parar Docker
npm run docker:down

# Limpar volumes
docker volume prune

# Subir novamente
npm run docker:up

# Aguardar e reiniciar app
npm run dev
```

---

## 🎯 Resumo

Você aprendeu a:
- ✅ Verificar se a API está rodando
- ✅ Fazer login
- ✅ Usar tokens de autenticação
- ✅ Criar usuários
- ✅ Listar usuários
- ✅ Usar Swagger UI
- ✅ Entender permissões

**Próximo:** [Estrutura do Projeto](./PROJECT_STRUCTURE.md)

---

**Última atualização:** 2025-01-10
