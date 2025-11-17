# 👥 Gestão de Usuários

## 📋 Visão Geral

Sistema completo de gestão de usuários com CRUD, autenticação e autorização.

**Baseado em:** [CleanArchitectureGuide/02-Documentacao-Entidade-Usuario.md](../../CleanArchitectureGuide/02-Documentacao-Entidade-Usuario.md)

---

## 🏗️ Estrutura da Entidade User

### Entidade de Domínio

```typescript
// src/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly is_superuser: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date,
    public readonly last_access: Date,
    public readonly last_login?: Date
  ) {}

  public isAdmin(): boolean {
    return this.is_superuser;
  }

  public canAccessResource(resourceOwnerId: number): boolean {
    return this.is_superuser || this.id === resourceOwnerId;
  }
}
```

---

## 📦 DTOs (Data Transfer Objects)

### CreateUserDTO
```typescript
export class CreateUserDTO {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsBoolean()
  is_superuser?: boolean;
}
```

### UpdateUserDTO
```typescript
export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsBoolean()
  is_superuser?: boolean;
}
```

### UserResponseDTO
```typescript
export class UserResponseDTO {
  id!: number;
  name!: string;
  email!: string;
  is_superuser!: boolean;
  last_access!: Date;
  last_login?: Date;
  created_at!: Date;
  updated_at!: Date;
}
```

---

## 🎯 Casos de Uso

### 1. Criar Usuário
**Use Case:** `UserUseCases.createUser()`

**Regras:**
- Email deve ser único
- Senha criptografada (bcrypt)
- `is_superuser` padrão: false
- Validação completa

### 2. Autenticar Usuário
**Use Case:** `AuthUseCases.authenticateUser()`

**Regras:**
- Verificar credenciais
- Atualizar `last_login`
- Rate limiting (5/15min)

### 3. Buscar por ID
**Use Case:** `UserUseCases.getUserById()`

**Regras:**
- Próprio usuário ou superusuário

### 4. Atualizar Usuário
**Use Case:** `UserUseCases.updateUser()`

**Regras:**
- Próprio usuário ou superusuário
- Email único se alterado
- Senha criptografada se fornecida

### 5. Deletar Usuário
**Use Case:** `UserUseCases.deleteUser()`

**Regras:**
- Próprio usuário ou superusuário
- Superusuário não pode deletar própria conta

### 6. Listar Usuários
**Use Case:** `UserUseCases.getAllUsers()`

**Regras:**
- Apenas superusuários
- Paginação obrigatória
- Limite máximo: 100/página

---

## 🌐 Endpoints da API

### Autenticação (Público)

#### POST /api/auth/register
Registrar novo usuário

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "message": "Usuário registrado com sucesso",
  "token": "...",
  "refreshToken": "...",
  "user": {
    "id": 2,
    "name": "João Silva",
    "email": "joao@example.com",
    "is_superuser": false
  }
}
```

#### POST /api/auth/login
Fazer login

**Request:**
```json
{
  "email": "admin@mestredb.com",
  "password": "MinhaSenh@123"
}
```

---

### Gestão de Usuários

#### GET /api/usuarios/me
Ver próprio perfil (requer autenticação)

**Response (200):**
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

#### PUT /api/usuarios/me
Atualizar próprio perfil

**Request:**
```json
{
  "name": "Novo Nome",
  "email": "novoemail@example.com",
  "password": "novasenha123"
}
```

#### POST /api/usuarios
Criar usuário (apenas superusuário)

**Request:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "is_superuser": false
}
```

#### GET /api/usuarios
Listar usuários (apenas superusuário)

**Query Params:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máx: 100)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### GET /api/usuarios/:id
Buscar usuário por ID (próprio ou superusuário)

#### PUT /api/usuarios/:id
Atualizar usuário (próprio ou superusuário)

#### DELETE /api/usuarios/:id
Deletar usuário (próprio ou superusuário*)

**Nota:** Superusuários não podem deletar própria conta

---

## 🔒 Regras de Autorização

### Usuário Normal
- ✅ Ver próprio perfil
- ✅ Editar próprio perfil
- ✅ Deletar própria conta
- ❌ Criar outros usuários
- ❌ Listar usuários
- ❌ Alterar `is_superuser`

### Superusuário
- ✅ Todas as permissões de usuário normal
- ✅ Criar usuários
- ✅ Listar todos os usuários
- ✅ Editar qualquer usuário
- ✅ Deletar qualquer usuário
- ❌ Deletar própria conta

---

## 🛡️ Segurança

### Validação
- class-validator nos DTOs
- Validações de domínio nas entidades
- Sanitização de entrada

### Criptografia
- bcrypt (12 salt rounds)
- Senhas nunca expostas
- Hash de 60 caracteres

### Rate Limiting
- Login: 5 tentativas/15min por IP+email
- Registro: 10 tentativas/15min
- Operações: 100 tentativas/15min

---

## 📊 Fluxos de Dados

### Fluxo de Registro
```
1. POST /api/auth/register
2. Validar dados (class-validator)
3. Verificar email único
4. Criptografar senha (bcrypt)
5. Criar usuário no banco
6. Gerar tokens JWT
7. Retornar resposta
```

### Fluxo de Login
```
1. POST /api/auth/login
2. Verificar rate limiting
3. Buscar usuário por email
4. Verificar senha (bcrypt)
5. Atualizar last_login e last_access
6. Gerar tokens JWT
7. Registrar tentativa
8. Retornar resposta
```

### Fluxo de Atualização
```
1. PUT /api/usuarios/:id
2. Verificar autenticação (JWT)
3. Verificar autorização
4. Validar dados
5. Verificar email único (se alterado)
6. Criptografar senha (se fornecida)
7. Atualizar no banco
8. Retornar dados atualizados
```

---

## ⚠️ Tratamento de Erros

### Códigos HTTP

| Code | Significado |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Usuário não encontrado |
| 409 | Conflict - Email já existe |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

### Exemplos de Erro

**Validação (400):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    {
      "field": "email",
      "message": "Email deve ter um formato válido"
    }
  ]
}
```

**Email já existe (409):**
```json
{
  "success": false,
  "message": "Email já está em uso"
}
```

**Rate limit (429):**
```json
{
  "success": false,
  "message": "Muitas tentativas. Tente novamente em 15 minutos."
}
```

---

## 📚 Referências

- [Authentication](./AUTHENTICATION.md)
- [Security](./SECURITY.md)
- [API Overview](../06-api-reference/API_OVERVIEW.md)
- [Guia Completo](../../CleanArchitectureGuide/02-Documentacao-Entidade-Usuario.md)
