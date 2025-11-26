# ✅ Implementação: Paginação Padronizada

**Data:** 2025-01-18
**Melhoria:** #4 do Roadmap
**Status:** ✅ Concluída

---

## 📋 O que foi implementado

Sistema completo de paginação padronizada e reutilizável para todos os endpoints da API, com validação automática, metadados ricos e documentação Swagger.

---

## 📁 Arquivos Criados

### 1. `src/application/dtos/PaginationDTO.ts`
- **PaginationParams**: Interface para parâmetros de entrada
- **PaginationMeta**: Metadados de paginação
- **PaginatedResponse<T>**: Resposta genérica paginada
- **PaginationHelper**: Classe utilitária com métodos helper

---

## 🔧 Arquivos Modificados

### 1. `src/application/usecases/UserUseCases.ts`
- Atualizado `getAllUsers()` para usar `PaginationParams`
- Mantido método legado para compatibilidade
- Usa `PaginationHelper` para criar respostas

### 2. `src/presentation/controllers/UserController.ts`
- Atualizado para usar `PaginationHelper.fromQuery()`
- Resposta padronizada com metadados
- Documentação Swagger atualizada

---

## ✨ Funcionalidades

### Parâmetros de Paginação

```typescript
interface PaginationParams {
  page: number;        // Número da página (mínimo: 1)
  limit: number;       // Itens por página (1-100)
  sortBy?: string;     // Campo para ordenação
  sortOrder?: 'ASC' | 'DESC';  // Ordem
}
```

### Metadados de Resposta

```typescript
interface PaginationMeta {
  page: number;        // Página atual
  limit: number;       // Itens por página
  total: number;       // Total de itens
  totalPages: number;  // Total de páginas
  hasNext: boolean;    // Tem próxima página?
  hasPrev: boolean;    // Tem página anterior?
}
```

### Resposta Padronizada

```typescript
interface PaginatedResponse<T> {
  data: T[];           // Array de dados
  pagination: PaginationMeta;  // Metadados
}
```

---

## 🎯 Validações Automáticas

### Valores Padrão
- **page**: 1 (se não fornecido ou inválido)
- **limit**: 10 (se não fornecido ou inválido)
- **sortOrder**: 'ASC' (se não fornecido)

### Limites
- **page mínimo**: 1
- **limit mínimo**: 1
- **limit máximo**: 100

### Normalização
- Valores negativos são convertidos para padrão
- Valores acima do máximo são limitados
- Strings são convertidas para números

---

## 🧪 Como Usar

### 1. Listar usuários (padrão)
```bash
GET /api/usuarios
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuários listados com sucesso",
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@mestredb.com",
      "is_superuser": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 2. Paginação customizada
```bash
GET /api/usuarios?page=2&limit=5
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuários listados com sucesso",
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

### 3. Com ordenação
```bash
GET /api/usuarios?sortBy=name&sortOrder=DESC
```

---

### 4. Combinado
```bash
GET /api/usuarios?page=3&limit=20&sortBy=created_at&sortOrder=DESC
```

---

## 💻 Uso no Código

### Em um Use Case

```typescript
import { PaginationParams, PaginationHelper, PaginatedResponse } from '../dtos/PaginationDTO';

async getItems(params: PaginationParams): Promise<PaginatedResponse<ItemDTO>> {
  // Valida parâmetros
  const validated = PaginationHelper.validateParams(params);

  // Calcula offset
  const offset = PaginationHelper.calculateOffset(validated.page, validated.limit);

  // Busca dados
  const { items, total } = await this.repository.findAll(offset, validated.limit);

  // Cria resposta paginada
  return PaginationHelper.createResponse(items, {
    page: validated.page,
    limit: validated.limit,
    total,
  });
}
```

### Em um Controller

```typescript
import { PaginationHelper } from '../../application/dtos/PaginationDTO';

async list(req: Request, res: Response): Promise<void> {
  // Extrai parâmetros da query string
  const params = PaginationHelper.fromQuery(req.query);

  // Chama use case
  const result = await this.useCase.getItems(params);

  // Retorna resposta padronizada
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}
```

---

## 🎨 Helpers Disponíveis

### 1. `validateParams()`
Valida e normaliza parâmetros de paginação

```typescript
const params = PaginationHelper.validateParams({
  page: -1,      // → 1 (corrigido)
  limit: 200,    // → 100 (limitado)
  sortOrder: 'desc'  // → 'DESC' (normalizado)
});
```

### 2. `calculateOffset()`
Calcula offset para query no banco

```typescript
const offset = PaginationHelper.calculateOffset(3, 10);
// Resultado: 20 (página 3, 10 itens por página)
```

### 3. `createMeta()`
Cria metadados de paginação

```typescript
const meta = PaginationHelper.createMeta({
  page: 2,
  limit: 10,
  total: 45
});
// Resultado: { page: 2, limit: 10, total: 45, totalPages: 5, hasNext: true, hasPrev: true }
```

### 4. `createResponse()`
Cria resposta paginada completa

```typescript
const response = PaginationHelper.createResponse(data, {
  page: 1,
  limit: 10,
  total: 100
});
```

### 5. `fromQuery()`
Extrai parâmetros de query string

```typescript
const params = PaginationHelper.fromQuery(req.query);
// Extrai page, limit, sortBy, sortOrder automaticamente
```

---

## 📊 Constantes Configuráveis

```typescript
PaginationHelper.DEFAULT_PAGE = 1;      // Página padrão
PaginationHelper.DEFAULT_LIMIT = 10;    // Limite padrão
PaginationHelper.MAX_LIMIT = 100;       // Limite máximo
PaginationHelper.MIN_LIMIT = 1;         // Limite mínimo
```

---

## 🔍 Exemplos de Uso

### Frontend - React

```typescript
const [users, setUsers] = useState([]);
const [pagination, setPagination] = useState(null);

async function loadUsers(page = 1) {
  const response = await fetch(`/api/usuarios?page=${page}&limit=10`);
  const json = await response.json();

  setUsers(json.data);
  setPagination(json.pagination);
}

// Componente de paginação
<Pagination
  currentPage={pagination.page}
  totalPages={pagination.totalPages}
  hasNext={pagination.hasNext}
  hasPrev={pagination.hasPrev}
  onPageChange={loadUsers}
/>
```

### Frontend - Vue

```vue
<template>
  <div>
    <UserList :users="users" />
    <Pagination
      :current="pagination.page"
      :total="pagination.totalPages"
      @change="loadUsers"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: [],
      pagination: {}
    }
  },
  methods: {
    async loadUsers(page = 1) {
      const { data, pagination } = await this.$api.get(`/usuarios?page=${page}`);
      this.users = data;
      this.pagination = pagination;
    }
  }
}
</script>
```

---

## 🎯 Benefícios

### 1. Consistência
- Todas as listagens usam o mesmo formato
- Facilita integração com frontend
- Documentação clara e padronizada

### 2. Validação Automática
- Parâmetros sempre válidos
- Sem valores negativos ou muito grandes
- Conversão automática de tipos

### 3. Metadados Ricos
- `hasNext` e `hasPrev` facilitam navegação
- `totalPages` para componentes de paginação
- `total` para exibir quantidade de resultados

### 4. Reutilizável
- Genérico (`PaginatedResponse<T>`)
- Funciona com qualquer entidade
- Fácil de estender

### 5. Type-Safe
- TypeScript garante tipos corretos
- Autocomplete no IDE
- Menos erros em runtime

---

## 🚀 Próximos Passos

### Aplicar em outros endpoints

```typescript
// Exemplo: Listar posts
async getAllPosts(params: PaginationParams): Promise<PaginatedResponse<PostDTO>> {
  const validated = PaginationHelper.validateParams(params);
  const { posts, total } = await this.postRepository.findAll(validated.page, validated.limit);

  return PaginationHelper.createResponse(posts, {
    page: validated.page,
    limit: validated.limit,
    total,
  });
}
```

### Adicionar filtros

```typescript
interface PaginationWithFilters extends PaginationParams {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
```

### Adicionar cursor-based pagination

Para grandes volumes de dados, considere implementar cursor-based pagination:

```typescript
interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
```

---

## 📚 Referências

- [REST API Pagination Best Practices](https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/)
- [Offset vs Cursor Pagination](https://slack.engineering/evolving-api-pagination-at-slack/)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

**Implementado por:** Kiro AI
**Tempo estimado:** 2-3 horas
**Tempo real:** ~2 horas
**Complexidade:** Baixa
**Impacto:** Médio ⭐⭐⭐⭐
