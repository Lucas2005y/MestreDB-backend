# 📮 Guia Completo: Postman para API MestreDB

## 🚀 Configuração Inicial no Postman

### **1. Criar uma Nova Collection**
1. Abra o Postman
2. Clique em "New" → "Collection"
3. Nome: "MestreDB API"
4. Descrição: "Testes da API do MestreDB"

### **2. Configurar Variáveis de Ambiente**
1. Clique no ícone de "Environment" (olho)
2. Clique em "Add"
3. Nome: "MestreDB Local"
4. Adicione as variáveis:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (deixe vazio por enquanto)

---

## 🆕 NOVO: Registro Público de Usuários

### **Configuração da Requisição:**

| Campo | Valor |
|-------|-------|
| **Método** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/register` |
| **Headers** | `Content-Type: application/json` |

### **Body (raw JSON):**
```json
{
  "name": "Novo Usuário",
  "email": "novo@exemplo.com",
  "password": "12345678"
}
```

### **Configuração no Postman:**
1. **Método**: Selecione `POST`
2. **URL**: Digite `{{baseUrl}}/api/auth/register`
3. **Headers**:
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body**:
   - Selecione `raw`
   - Selecione `JSON` no dropdown
   - Cole o JSON acima

### **Observações Importantes:**
- ✅ **NÃO requer autenticação** - qualquer pessoa pode se registrar
- ✅ **Usuários criados são normais** (não superusuários)
- ✅ **Retorna tokens** de acesso e refresh automaticamente
- ⚠️ **Senha mínima**: 8 caracteres
- ⚠️ **Email único**: não pode existir outro usuário com o mesmo email

---

## 🔐 PASSO 1: Fazer Login (Obter Token)

### **Configuração da Requisição:**

| Campo | Valor |
|-------|-------|
| **Método** | `POST` |
| **URL** | `{{baseUrl}}/api/auth/login` |
| **Headers** | `Content-Type: application/json` |

### **Body (raw JSON):**
```json
{
  "email": "admin@mestredb.com",
  "password": "admin123"
}
```

### **Configuração no Postman:**
1. **Método**: Selecione `POST`
2. **URL**: Digite `{{baseUrl}}/api/auth/login`
3. **Headers**:
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body**:
   - Selecione `raw`
   - Selecione `JSON` no dropdown
   - Cole o JSON acima

### **Após Enviar:**
1. **Copie o token** da resposta
2. **Vá em Environment** → "MestreDB Local"
3. **Cole o token** na variável `token`

---

## 👤 PASSO 2: Criar Usuário

### **Configuração da Requisição:**

| Campo | Valor |
|-------|-------|
| **Método** | `POST` |
| **URL** | `{{baseUrl}}/api/usuarios` |
| **Headers** | `Content-Type: application/json`<br>`Authorization: Bearer {{token}}` |

### **Body (raw JSON):**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "12345678",
  "is_superuser": false
}
```

### **Configuração Detalhada no Postman:**

#### **1. Método e URL:**
- **Método**: `POST`
- **URL**: `{{baseUrl}}/api/usuarios`

#### **2. Headers:**
| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer {{token}}` |

#### **3. Body:**
- Selecione `raw`
- Selecione `JSON`
- Cole o JSON do usuário

#### **4. Variações de Usuário:**

**Usuário Normal:**
```json
{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "password": "senha123",
  "is_superuser": false
}
```

**Usuário Administrador:**
```json
{
  "name": "Carlos Admin",
  "email": "carlos@admin.com",
  "password": "admin456",
  "is_superuser": true
}
```

---

## 📋 Outras Operações Úteis

### **3. Listar Usuários**

| Campo | Valor |
|-------|-------|
| **Método** | `GET` |
| **URL** | `{{baseUrl}}/api/usuarios` |
| **Headers** | `Authorization: Bearer {{token}}` |
| **Body** | (vazio) |

### **4. Buscar Usuário por ID**

| Campo | Valor |
|-------|-------|
| **Método** | `GET` |
| **URL** | `{{baseUrl}}/api/usuarios/2` |
| **Headers** | `Authorization: Bearer {{token}}` |
| **Body** | (vazio) |

### **5. Atualizar Usuário**

| Campo | Valor |
|-------|-------|
| **Método** | `PUT` |
| **URL** | `{{baseUrl}}/api/usuarios/2` |
| **Headers** | `Content-Type: application/json`<br>`Authorization: Bearer {{token}}` |

**Body:**
```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@exemplo.com"
}
```

### **6. Deletar Usuário**

| Campo | Valor |
|-------|-------|
| **Método** | `DELETE` |
| **URL** | `{{baseUrl}}/api/usuarios/2` |
| **Headers** | `Authorization: Bearer {{token}}` |
| **Body** | (vazio) |

---

## 🎯 Configuração Rápida - Passo a Passo

### **Para Criar Usuário AGORA:**

1. **Abra o Postman**

2. **Nova Requisição - LOGIN:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "email": "admin@mestredb.com",
       "password": "admin123"
     }
     ```
   - **Envie** e **copie o token**

3. **Nova Requisição - CRIAR USUÁRIO:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/usuarios`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer SEU_TOKEN_AQUI`
   - Body (raw JSON):
     ```json
     {
       "name": "Novo Usuário",
       "email": "novo@exemplo.com",
       "password": "12345678",
       "is_superuser": false
     }
     ```

---

## 🔐 Sistema de Permissões Atualizado

### **Registro de Usuários:**
- 🆕 **Registro Público**: `/api/auth/register` - Qualquer pessoa pode criar conta
- 👑 **Criação por Admin**: `/api/usuarios` - Apenas superusuários podem criar contas para outros

### **Permissões de Usuários:**

#### **👤 Usuário Normal pode:**
- ✅ Visualizar própria conta (`GET /api/usuarios/me`)
- ✅ Editar própria conta (`PUT /api/usuarios/{seu_id}`)
- ✅ Deletar própria conta (`DELETE /api/usuarios/{seu_id}`)

#### **👑 Superusuário pode:**
- ✅ Todas as permissões de usuário normal
- ✅ Visualizar todas as contas (`GET /api/usuarios`)
- ✅ Criar contas para outros (`POST /api/usuarios`)
- ✅ Editar qualquer conta (`PUT /api/usuarios/{qualquer_id}`)
- ✅ Deletar outras contas (`DELETE /api/usuarios/{outro_id}`)
- ❌ **NÃO pode deletar própria conta** (proteção de segurança)

### **Exemplos de Uso:**

#### **Auto-gestão de Conta (Usuário Normal):**
```json
// Atualizar próprios dados
PUT /api/usuarios/2
Authorization: Bearer {token_do_usuario_id_2}
{
  "name": "Novo Nome",
  "email": "novo@email.com"
}
```

#### **Gestão por Admin:**
```json
// Admin criando usuário para outro
POST /api/usuarios
Authorization: Bearer {token_admin}
{
  "name": "Funcionário Novo",
  "email": "funcionario@empresa.com",
  "password": "12345678",
  "is_superuser": false
}
```

---

## 🔧 Troubleshooting

### **Erro 401 - Unauthorized**
- ✅ Verifique se o token está correto
- ✅ Confirme que o header Authorization está presente
- ✅ Verifique se não há espaços extras no token

### **Erro 400 - Bad Request**
- ✅ Verifique se o JSON está válido
- ✅ Confirme se todos os campos obrigatórios estão presentes
- ✅ Verifique se a senha tem pelo menos 8 caracteres

### **Erro 500 - Internal Server Error**
- ✅ Verifique se o servidor está rodando
- ✅ Confirme se o banco de dados está conectado
- ✅ Veja os logs do servidor no terminal

---

## 📊 Respostas Esperadas

### **Login Bem-Sucedido (200):**
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Usuário Criado (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": "3",
    "name": "Novo Usuário",
    "email": "novo@exemplo.com",
    "is_superuser": false,
    "created_at": "2025-01-24T18:30:00.000Z"
  }
}
```

### **Erro de Validação (400):**
```json
{
  "success": false,
  "message": "Dados inválidos: Senha deve ter pelo menos 8 caracteres"
}
```

---

## 🎉 Pronto!

Agora você pode usar o Postman para testar toda a API de forma profissional! 🚀