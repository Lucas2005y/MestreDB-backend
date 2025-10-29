# Documentação da Entidade Usuário - MestreDB Backend

## 📋 Visão Geral

Este documento detalha completamente a entidade usuário no sistema MestreDB, incluindo todos os casos de uso, regras de negócio, endpoints, DTOs e fluxos de dados implementados.

## 🏗️ Estrutura da Entidade

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

### Entidade de Banco (TypeORM)

```typescript
// src/infrastructure/database/entities/User.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'boolean', default: false })
  is_superuser!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  last_access!: Date;

  @Column({ type: 'datetime', nullable: true })
  last_login?: Date;
}
```

## 📊 Data Transfer Objects (DTOs)

### CreateUserDTO

```typescript
export class CreateUserDTO {
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
  name!: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(254, { message: 'Email deve ter no máximo 254 caracteres' })
  email!: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password!: string;

  @IsOptional()
  @IsBoolean({ message: 'is_superuser deve ser um boolean' })
  is_superuser?: boolean;
}
```

### UpdateUserDTO

```typescript
export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(254, { message: 'Email deve ter no máximo 254 caracteres' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password?: string;

  @IsOptional()
  @IsBoolean({ message: 'is_superuser deve ser um boolean' })
  is_superuser?: boolean;
}
```

### UpdateOwnProfileDTO

```typescript
export class UpdateOwnProfileDTO {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  @MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(254, { message: 'Email deve ter no máximo 254 caracteres' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password?: string;
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

### PaginatedUsersResponseDTO

```typescript
export class PaginatedUsersResponseDTO {
  users!: UserResponseDTO[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
```

## 🔧 Casos de Uso

### 1. Criar Usuário

**Método:** `createUser(userData: CreateUserDTO): Promise<UserResponseDTO>`

**Regras de Negócio:**
- Email deve ser único no sistema
- Senha deve ser criptografada antes do armazenamento
- `is_superuser` padrão é `false`
- Validação completa dos dados de entrada

**Fluxo:**
1. Validar dados de entrada (class-validator)
2. Verificar se email já existe
3. Criptografar senha com bcrypt
4. Criar usuário no banco
5. Retornar dados do usuário (sem senha)

### 2. Autenticar Usuário

**Método:** `authenticateUser(email: string, password: string): Promise<UserResponseDTO | null>`

**Regras de Negócio:**
- Verificar credenciais válidas
- Atualizar `last_login` em caso de sucesso
- Atualizar `last_access` sempre
- Rate limiting aplicado (5 tentativas por 15 minutos)

**Fluxo:**
1. Buscar usuário por email
2. Verificar senha com bcrypt
3. Atualizar timestamps de acesso
4. Retornar dados do usuário ou null

### 3. Buscar Usuário por ID

**Método:** `getUserById(id: number): Promise<UserResponseDTO | null>`

**Regras de Negócio:**
- Usuário só pode acessar próprios dados ou ser superusuário
- Retornar null se não encontrado

### 4. Buscar Usuário por Email

**Método:** `getUserByEmail(email: string): Promise<UserResponseDTO | null>`

**Regras de Negócio:**
- Usado principalmente para autenticação
- Verificação de unicidade

### 5. Atualizar Usuário

**Método:** `updateUser(id: number, userData: UpdateUserDTO): Promise<UserResponseDTO>`

**Regras de Negócio:**
- Apenas superusuários podem alterar `is_superuser`
- Email deve permanecer único
- Senha deve ser criptografada se fornecida
- Usuário só pode atualizar próprios dados ou ser superusuário

### 6. Atualizar Próprio Perfil

**Método:** `updateOwnProfile(id: number, userData: UpdateOwnProfileDTO): Promise<UserResponseDTO>`

**Regras de Negócio:**
- Usuário não pode alterar `is_superuser`
- Validações de segurança aplicadas
- Email deve permanecer único

### 7. Deletar Usuário

**Método:** `deleteUser(id: number): Promise<void>`

**Regras de Negócio:**
- Apenas superusuários podem deletar outros usuários
- Usuário pode deletar própria conta
- Operação irreversível

### 8. Listar Usuários (Paginado)

**Método:** `getAllUsers(page: number, limit: number): Promise<PaginatedUsersResponseDTO>`

**Regras de Negócio:**
- Apenas superusuários podem listar usuários
- Paginação obrigatória
- Limite máximo de 100 itens por página

## 🌐 Endpoints da API

### Autenticação

#### POST /api/auth/login
**Descrição:** Realizar login no sistema

**Request Body:**
```json
{
  "email": "admin@mestredb.com",
  "password": "admin123"
}
```

**Response (200):**
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

**Rate Limiting:** 5 tentativas por 15 minutos por IP+email

#### POST /api/auth/register
**Descrição:** Registrar novo usuário

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "minhasenha123"
}
```

**Response (201):**
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

#### POST /api/auth/refresh
**Descrição:** Renovar token de acesso

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/logout
**Descrição:** Realizar logout (invalidar tokens)
**Autenticação:** Requerida

#### GET /api/auth/me
**Descrição:** Obter dados do usuário logado
**Autenticação:** Requerida

### Usuários

#### GET /api/users/me
**Descrição:** Obter perfil do usuário logado
**Autenticação:** Requerida

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@mestredb.com",
    "is_superuser": true,
    "last_access": "2024-01-15T10:30:00.000Z",
    "last_login": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT /api/users/me
**Descrição:** Atualizar próprio perfil
**Autenticação:** Requerida

**Request Body:**
```json
{
  "name": "Novo Nome",
  "email": "novoemail@example.com",
  "password": "novasenha123"
}
```

#### POST /api/users
**Descrição:** Criar novo usuário (apenas superusuários)
**Autenticação:** Requerida (superusuário)

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "password": "senha123",
  "is_superuser": false
}
```

#### GET /api/users
**Descrição:** Listar usuários com paginação (apenas superusuários)
**Autenticação:** Requerida (superusuário)

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)

**Response (200):**
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
        "last_access": "2024-01-15T10:30:00.000Z",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### GET /api/users/:id
**Descrição:** Obter usuário por ID
**Autenticação:** Requerida (próprio usuário ou superusuário)

#### PUT /api/users/:id
**Descrição:** Atualizar usuário por ID
**Autenticação:** Requerida (próprio usuário ou superusuário)

#### DELETE /api/users/:id
**Descrição:** Deletar usuário por ID
**Autenticação:** Requerida (próprio usuário ou superusuário)

## 🔒 Regras de Autorização

### Níveis de Acesso

1. **Usuário Comum:**
   - Pode acessar e modificar apenas seus próprios dados
   - Não pode criar outros usuários
   - Não pode listar usuários
   - Não pode alterar `is_superuser`

2. **Superusuário:**
   - Acesso completo a todos os recursos
   - Pode criar, ler, atualizar e deletar qualquer usuário
   - Pode alterar `is_superuser` de outros usuários
   - Pode listar todos os usuários

### Middlewares de Autorização

```typescript
// Verificar se é superusuário
requireSuperUser

// Verificar se é o próprio usuário ou superusuário
requireOwnershipOrSuperUser

// Verificar permissões específicas para modificação
requireOwnershipOrSuperUserForModification

// Verificar permissões específicas para deleção
requireOwnershipOrSuperUserForDeletion

// Verificar permissões para listagem
requireSuperUserForListing

// Verificar permissões para criação
requireSuperUserForCreation
```

## 🛡️ Segurança Implementada

### 1. Criptografia de Senhas
- **Algoritmo:** bcrypt com salt rounds configurável
- **Verificação:** Comparação segura durante autenticação

### 2. Rate Limiting
- **Login:** 5 tentativas por 15 minutos por IP+email
- **Registro:** Limite geral de API
- **Operações sensíveis:** Limite mais restritivo

### 3. Validação de Dados
- **class-validator:** Validação automática de DTOs
- **Sanitização:** Prevenção de ataques de injeção
- **Tipos seguros:** TypeScript para verificação em tempo de compilação

### 4. Autenticação JWT
- **Access Token:** Curta duração (15 minutos)
- **Refresh Token:** Longa duração (7 dias)
- **Invalidação:** Logout invalida tokens

### 5. Auditoria
- **Logs de acesso:** Registro de todas as tentativas de login
- **Logs de operações:** Registro de operações CRUD
- **Timestamps:** Rastreamento de `last_access` e `last_login`

## 📊 Fluxos de Dados

### Fluxo de Registro

```
1. POST /api/auth/register
   ↓
2. Validar dados (class-validator)
   ↓
3. Verificar email único
   ↓
4. Criptografar senha (bcrypt)
   ↓
5. Criar usuário no banco
   ↓
6. Gerar tokens JWT
   ↓
7. Retornar resposta com tokens
```

### Fluxo de Login

```
1. POST /api/auth/login
   ↓
2. Verificar rate limiting
   ↓
3. Buscar usuário por email
   ↓
4. Verificar senha (bcrypt)
   ↓
5. Atualizar last_login e last_access
   ↓
6. Gerar tokens JWT
   ↓
7. Registrar tentativa (sucesso/falha)
   ↓
8. Retornar resposta
```

### Fluxo de Atualização de Perfil

```
1. PUT /api/users/me
   ↓
2. Verificar autenticação (JWT)
   ↓
3. Validar dados (class-validator)
   ↓
4. Verificar email único (se alterado)
   ↓
5. Criptografar senha (se fornecida)
   ↓
6. Atualizar usuário no banco
   ↓
7. Retornar dados atualizados
```

## 🧪 Exemplos de Uso

### Criar Usuário Administrador

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Admin Sistema",
    "email": "admin.sistema@mestredb.com",
    "password": "senhaSegura123",
    "is_superuser": true
  }'
```

### Buscar Usuários com Paginação

```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Atualizar Próprio Perfil

```bash
curl -X PUT http://localhost:3000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Novo Nome",
    "email": "novoemail@example.com"
  }'
```

## ⚠️ Tratamento de Erros

### Códigos de Status HTTP

- **200:** Operação bem-sucedida
- **201:** Recurso criado com sucesso
- **400:** Dados inválidos ou erro de validação
- **401:** Não autenticado
- **403:** Não autorizado (sem permissão)
- **404:** Usuário não encontrado
- **409:** Conflito (email já existe)
- **429:** Rate limit excedido
- **500:** Erro interno do servidor

### Exemplos de Respostas de Erro

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

## 📈 Métricas e Monitoramento

### Logs de Auditoria

- **LOGIN_SUCCESS:** Login bem-sucedido
- **LOGIN_FAILED:** Tentativa de login falhada
- **USER_CREATED:** Usuário criado
- **USER_UPDATED:** Usuário atualizado
- **USER_DELETED:** Usuário deletado
- **PROFILE_UPDATED:** Perfil atualizado

### Métricas Recomendadas

- Taxa de sucesso de login
- Tentativas de força bruta
- Usuários ativos por período
- Operações por usuário
- Performance dos endpoints

---

## 🎯 Próximos Passos

1. **Implementar soft delete** para usuários
2. **Adicionar campos personalizados** (avatar, telefone, etc.)
3. **Implementar recuperação de senha** via email
4. **Adicionar autenticação 2FA** para superusuários
5. **Criar dashboard administrativo** para gestão de usuários

Esta documentação fornece uma visão completa da entidade usuário, servindo como referência para desenvolvimento, manutenção e integração com o sistema MestreDB.