# 🔧 Guia de Desenvolvimento

## 📋 Workflow Diário

### 1. Iniciar Ambiente

```bash
# Terminal 1: Docker
npm run docker:up

# Terminal 2: Aplicação
npm run dev

# Terminal 3: Testes (opcional)
npm run test:watch
```

---

## 🛠️ Comandos Essenciais

### Desenvolvimento
```bash
npm run dev              # Modo desenvolvimento
npm run build            # Compilar
npm run start            # Produção
```

### Testes
```bash
npm test                 # Todos os testes
npm run test:watch       # Watch mode
npm run test:coverage    # Com coverage
```

### Qualidade
```bash
npm run lint             # Verificar
npm run lint:fix         # Corrigir
npm run format           # Formatar
```

### Banco de Dados
```bash
npm run migration:generate -- NomeMigration
npm run migration:run
npm run migration:revert
```

---

## 🎯 Criando uma Feature

### Passo 1: Entidade (Domain)
```typescript
// src/domain/entities/Product.ts
export class Product {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly price: number
  ) {
    this.validatePrice();
  }
}
```

### Passo 2: Interface (Domain)
```typescript
// src/domain/interfaces/IProductRepository.ts
export interface IProductRepository {
  create(data: CreateProductData): Promise<Product>;
  findById(id: number): Promise<Product | null>;
}
```

### Passo 3: Use Case (Application)
```typescript
// src/application/usecases/ProductUseCases.ts
export class ProductUseCases {
  async createProduct(data: CreateProductDTO) {
    // Lógica de negócio
  }
}
```

### Passo 4: Repository (Infrastructure)
```typescript
// src/infrastructure/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  async create(data: CreateProductData): Promise<Product> {
    // Implementação
  }
}
```

### Passo 5: Controller (Presentation)
```typescript
// src/presentation/controllers/ProductController.ts
export class ProductController {
  async createProduct(req: Request, res: Response) {
    const product = await this.productUseCases.createProduct(req.body);
    res.json({ success: true, data: product });
  }
}
```

### Passo 6: Routes (Presentation)
```typescript
// src/presentation/routes/productRoutes.ts
router.post('/products', productController.createProduct);
```

---

## 🐛 Debugging

### VS Code
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug",
  "runtimeArgs": ["-r", "ts-node/register"],
  "args": ["${workspaceFolder}/src/index.ts"]
}
```

### Console
```typescript
console.log('Debug:', variable);
console.table(array);
console.trace();
```

---

## ✅ Checklist

Antes de commitar:
- [ ] Código compila sem erros
- [ ] Testes passando
- [ ] Lint sem erros
- [ ] Código formatado
- [ ] Documentação atualizada

---

## 📚 Referências

- [Criando Features](./CREATING_FEATURES.md)
- [Guia de Testes](./TESTING_GUIDE.md)
- [Padrões de Código](./CODE_PATTERNS.md)
