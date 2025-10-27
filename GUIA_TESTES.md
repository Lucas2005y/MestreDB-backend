# 🧪 Guia de Testes da API MestreDB

## 📋 Pré-requisitos

1. **Servidor rodando**: Certifique-se de que o servidor está executando na porta 3000
2. **Extensão REST Client**: Instale a extensão "REST Client" no VS Code
3. **Arquivo de testes**: Use o arquivo `api-tests.http`

## 🚀 Como Testar o Fluxo Completo

### 1️⃣ **Primeiro Passo: Testes de Infraestrutura**

Execute os testes 1-3 para verificar se o servidor está funcionando:

```http
### 1. Health Check
GET http://localhost:3000/health

### 2. API Root
GET http://localhost:3000/api

### 3. Documentação Swagger
GET http://localhost:3000/api-docs
```

**Resultado esperado**: Status 200 OK para todos

---

### 2️⃣ **Segundo Passo: Teste de Login**

Execute o teste 4 para fazer login e obter o token:

```http
### 4. Login com Sucesso
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@mestredb.com",
  "password": "admin123"
}
```

**Resultado esperado**:
- Status: 200 OK
- Resposta: `{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}`

**⚠️ IMPORTANTE**: Copie o token da resposta!

---

### 3️⃣ **Terceiro Passo: Substituir o Token**

1. **Copie o token** da resposta do login (sem as aspas)
2. **Substitua** `SEU_TOKEN_AQUI` em todos os testes por seu token real
3. **Exemplo**:
   ```http
   # ANTES:
   Authorization: Bearer SEU_TOKEN_AQUI
   
   # DEPOIS:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AbWVzdHJlZGIuY29tIiwiaXNfc3VwZXJ1c2VyIjp0cnVlLCJpYXQiOjE3MzQzNzI4NzIsImV4cCI6MTczNDM3NjQ3Mn0.abc123...
   ```

---

### 4️⃣ **Quarto Passo: Testar Autenticação**

Execute os testes 8-10 para verificar se o token está funcionando:

```http
### 8. Obter Informações do Usuário Logado
GET http://localhost:3000/api/auth/me
Authorization: Bearer SEU_TOKEN_REAL_AQUI
```

**Resultado esperado**:
- Status: 200 OK
- Dados do usuário admin

---

### 5️⃣ **Quinto Passo: Testar CRUD de Usuários**

Execute os testes 11-19 para testar operações com usuários:

```http
### 11. Criar Usuário
POST http://localhost:3000/api/usuarios
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_REAL_AQUI

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "123456",
  "is_superuser": false
}
```

---

### 6️⃣ **Sexto Passo: Testar Validações de Segurança**

Execute os testes 20-22 para verificar se a autenticação está protegendo as rotas:

```http
### 20. Teste sem Autenticação - Deve falhar
GET http://localhost:3000/api/usuarios

### 22. Teste com Token Inválido - Deve falhar
GET http://localhost:3000/api/usuarios
Authorization: Bearer token_invalido_aqui
```

**Resultado esperado**: Status 401 Unauthorized

---

## 🎯 Cenários de Teste Importantes

### ✅ **Testes que DEVEM funcionar (Status 200)**
- Health check
- Login com credenciais corretas
- Operações com token válido
- Refresh token
- Logout

### ❌ **Testes que DEVEM falhar (Status 401/400)**
- Login com credenciais incorretas
- Operações sem token
- Operações com token inválido
- Operações com token expirado

### 🔄 **Fluxo Completo de Teste**

1. **Login** → Obter token
2. **Me** → Verificar usuário logado
3. **Criar usuário** → Testar criação
4. **Listar usuários** → Ver lista atualizada
5. **Atualizar usuário** → Modificar dados
6. **Deletar usuário** → Remover usuário
7. **Logout** → Invalidar token

---

## 🛠️ Dicas de Uso

### **No VS Code com REST Client:**

1. **Executar teste individual**: Clique em "Send Request" acima de cada teste
2. **Ver resposta**: A resposta aparece em uma nova aba
3. **Copiar token**: Clique com botão direito na resposta → "Copy Response Body"

### **Substituição rápida de token:**

1. Use `Ctrl+H` para abrir "Find and Replace"
2. Busque: `SEU_TOKEN_AQUI`
3. Substitua: `seu_token_real_copiado`
4. Clique em "Replace All"

### **Verificar logs do servidor:**

- Monitore o terminal onde o servidor está rodando
- Veja as requisições sendo processadas
- Identifique erros em tempo real

---

## 🚨 Solução de Problemas

### **Token expirado?**
- Execute novamente o teste de login (teste 4)
- Copie o novo token
- Substitua nos testes

### **Erro 401 Unauthorized?**
- Verifique se o token está correto
- Verifique se não há espaços extras
- Confirme que o header Authorization está presente

### **Erro 500 Internal Server Error?**
- Verifique os logs do servidor
- Confirme se o banco de dados está conectado
- Verifique se não há erros de sintaxe

---

## 📊 Resultados Esperados

| Teste | Status | Descrição |
|-------|--------|-----------|
| 1-3 | 200 | Infraestrutura funcionando |
| 4 | 200 | Login bem-sucedido |
| 5-7 | 400/401 | Validações de login |
| 8-10 | 200 | Operações autenticadas |
| 11-19 | 200 | CRUD de usuários |
| 20-22 | 401 | Proteção de rotas |
| 23-27 | 400/404 | Validações de dados |

---

**🎉 Pronto! Agora você pode testar toda a API de forma organizada e sistemática.**