# 🎯 Exemplo Prático: Como Testar a API no VS Code

## 📋 Pré-requisitos

1. **VS Code** com extensão **REST Client** instalada
2. **Servidor rodando** na porta 3000
3. Arquivo `api-tests.http` aberto no VS Code

## 🚀 Passo a Passo Prático

### **1. Abrir o arquivo de testes**

1. No VS Code, abra o arquivo `api-tests.http`
2. Você verá botões "Send Request" acima de cada teste

### **2. Fazer Login e Obter Token**

1. **Localize o teste 4** (Login com Sucesso):
   ```http
   ### 4. Login com Sucesso
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@mestredb.com",
     "password": "admin123"
   }
   ```

2. **Clique em "Send Request"** acima do teste
3. **Copie o token** da resposta (sem as aspas):
   ```json
   {
     "message": "Login realizado com sucesso",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

### **3. Substituir o Token nos Testes**

1. **Use Ctrl+H** para abrir Find & Replace
2. **Busque por**: `SEU_TOKEN_AQUI`
3. **Substitua por**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (seu token real)
4. **Clique em "Replace All"**

### **4. Testar Rotas Protegidas**

Agora você pode testar qualquer rota que requer autenticação:

#### **Teste 8 - Informações do Usuário:**
```http
### 8. Obter Informações do Usuário Logado
GET http://localhost:3000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Teste 13 - Listar Usuários:**
```http
### 13. Listar Usuários (Requer Autenticação de Admin)
GET http://localhost:3000/api/usuarios?page=1&limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Teste 11 - Criar Usuário:**
```http
### 11. Criar Usuário (Requer Autenticação de Admin)
POST http://localhost:3000/api/usuarios
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "12345678",
  "is_superuser": false
}
```

### **5. Testar Validações de Segurança**

#### **Teste sem Token (Deve falhar):**
```http
### 20. Teste sem Autenticação - Deve falhar
GET http://localhost:3000/api/usuarios
```
**Resultado esperado**: 401 Unauthorized

#### **Teste com Token Inválido (Deve falhar):**
```http
### 22. Teste com Token Inválido - Deve falhar
GET http://localhost:3000/api/usuarios
Authorization: Bearer token_invalido_aqui
```
**Resultado esperado**: 401 Unauthorized

## 📊 Resultados dos Testes Demonstrados

### ✅ **Testes Bem-Sucedidos:**

1. **Login**: Status 200 ✅
   ```json
   {
     "message": "Login realizado com sucesso",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

2. **Informações do Usuário**: Status 200 ✅
   ```json
   {
     "user": {
       "userId": "1",
       "email": "admin@mestredb.com",
       "is_superuser": true
     }
   }
   ```

3. **Listar Usuários**: Status 200 ✅
   ```json
   {
     "success": true,
     "message": "Usuários listados com sucesso",
     "data": {
       "users": [...],
       "total": 2
     }
   }
   ```

4. **Criar Usuário**: Status 201 ✅
   ```json
   {
     "success": true,
     "message": "Usuário criado com sucesso",
     "data": {
       "id": "2",
       "name": "João Silva",
       "email": "joao@exemplo.com",
       "is_superuser": false
     }
   }
   ```

5. **Logout**: Status 200 ✅
   ```json
   {
     "message": "Logout realizado com sucesso"
   }
   ```

### ❌ **Testes de Validação (Devem falhar):**

1. **Acesso sem Token**: Status 401 ❌
   ```json
   {
     "error": "Token de acesso requerido",
     "message": "Você precisa estar logado para acessar este recurso"
   }
   ```

2. **Senha Muito Curta**: Status 400 ❌
   ```json
   {
     "success": false,
     "message": "Dados inválidos: Senha deve ter pelo menos 8 caracteres"
   }
   ```

## 🎯 Fluxo Completo de Teste

### **Sequência Recomendada:**

1. **Infraestrutura** (Testes 1-3)
2. **Login** (Teste 4) → Copiar token
3. **Substituir tokens** nos demais testes
4. **Autenticação** (Testes 8-10)
5. **CRUD Usuários** (Testes 11-19)
6. **Validações** (Testes 20-27)

### **Dicas Importantes:**

- ⏰ **Tokens expiram**: Se receber 401, faça login novamente
- 🔄 **Substitua tokens**: Use Find & Replace para atualizar todos
- 📝 **Monitore logs**: Acompanhe o terminal do servidor
- ✅ **Verifique status**: 200/201 = sucesso, 400/401 = erro esperado

## 🎉 Conclusão

Agora você tem um sistema completo de testes funcionando com:

- ✅ **Autenticação JWT** funcionando
- ✅ **Proteção de rotas** ativa
- ✅ **Validações** de dados
- ✅ **CRUD completo** de usuários
- ✅ **Testes automatizados** no VS Code

**Tudo está 100% funcional e pronto para uso!** 🚀