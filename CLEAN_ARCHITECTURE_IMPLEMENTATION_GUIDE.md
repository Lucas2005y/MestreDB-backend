# Guia de Implementação - Clean Architecture

## 📋 Índice
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Implementando uma Nova Entidade](#implementando-uma-nova-entidade)
4. [Passo a Passo Detalhado](#passo-a-passo-detalhado)
5. [Padrões e Convenções](#padrões-e-convenções)
6. [Injeção de Dependência](#injeção-de-dependência)
7. [Exemplos Práticos](#exemplos-práticos)

## 🏗️ Visão Geral da Arquitetura

Este projeto segue os princípios da Clean Architecture com as seguintes camadas:

```
┌─────────────────────────────────────────┐
│           PRESENTATION LAYER            │
│        (Controllers, Routes)            │
├─────────────────────────────────────────┤
│          APPLICATION LAYER              │
│         (Use Cases, DTOs)               │
├─────────────────────────────────────────┤
│            DOMAIN LAYER                 │
│      (Entities, Interfaces)             │
├─────────────────────────────────────────┤
│         INFRASTRUCTURE LAYER            │
│    (Repositories, Database, Config)     │
└─────────────────────────────────────────┘
```

### Regras de Dependência
- **Camadas externas** podem depender de **camadas internas**
- **Camadas internas** NUNCA dependem de **camadas externas**
- O **Domain** é independente de qualquer framework ou tecnologia

## 📁 Estrutura de Diretórios

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/             # Entidades de negócio
│   └── interfaces/           # Contratos/Interfaces
├── application/              # Camada de Aplicação
│   ├── usecases/            # Casos de uso
│   └── dtos/                # Data Transfer Objects
├── infrastructure/          # Camada de Infraestrutura
│   ├── repositories/        # Implementações de repositórios
│   ├── database/           # Configuração e entidades do banco
│   └── config/             # Configurações
├── presentation/           # Camada de Apresentação
│   ├── controllers/        # Controllers HTTP
│   ├── routes/            # Definição de rotas
│   └── middlewares/       # Middlewares
└── shared/                # Utilitários compartilhados
    ├── container/         # Injeção de dependência
    ├── errors/           # Classes de erro
    └── utils/            # Utilitários gerais
```

## 🚀 Implementando uma Nova Entidade

Vamos usar como exemplo a implementação de uma entidade **Product** (Produto), seguindo o padrão já estabelecido com **User**.

### Passo 1: Definir a Entidade de Domínio

**Arquivo:** `src/domain/entities/Product.ts`

```typescript
export class Product {
  constructor(
    public readonly id: number,
    public name: string,
    public description: string,
    public price: number,
    public category: string,
    public stock: number,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Regras de negócio
  isAvailable(): boolean {
    return this.isActive && this.stock > 0;
  }

  updateStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock cannot be negative');
    }
    this.stock = quantity;
    this.updatedAt = new Date();
  }

  updatePrice(newPrice: number): void {
    if (newPrice <= 0) {
      throw new Error('Price must be greater than zero');
    }
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Serialização (remove dados sensíveis se necessário)
  toJSON(): Omit<Product, 'somePrivateField'> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      stock: this.stock,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
```

### Passo 2: Definir a Interface do Repositório

**Arquivo:** `src/domain/interfaces/IProductRepository.ts`

```typescript
import { Product } from '../entities/Product';

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  isActive?: boolean;
}

export interface IProductRepository {
  create(data: CreateProductData): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  findAll(filters?: { isActive?: boolean; category?: string }): Promise<Product[]>;
  update(id: number, data: UpdateProductData): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
  updateStock(id: number, quantity: number): Promise<Product | null>;
}
```

### Passo 3: Criar DTOs

**Arquivo:** `src/application/dtos/ProductDTO.ts`

```typescript
import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateProductDTO {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsString()
  @MaxLength(100)
  category!: string;

  @IsNumber()
  @Min(0)
  stock!: number;
}

export class UpdateProductDTO {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export interface ProductResponseDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Passo 4: Implementar os Use Cases

**Arquivo:** `src/application/usecases/ProductUseCases.ts`

```typescript
import { validate } from 'class-validator';
import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/interfaces/IProductRepository';
import { CreateProductDTO, UpdateProductDTO, ProductResponseDTO } from '../dtos/ProductDTO';

export class ProductUseCases {
  constructor(private productRepository: IProductRepository) {}

  async createProduct(data: CreateProductDTO): Promise<ProductResponseDTO> {
    // Validação
    const errors = await validate(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.toString()).join(', ')}`);
    }

    // Criar produto
    const product = await this.productRepository.create({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      stock: data.stock
    });

    return this.mapToResponseDTO(product);
  }

  async getProductById(id: number): Promise<ProductResponseDTO | null> {
    const product = await this.productRepository.findById(id);
    return product ? this.mapToResponseDTO(product) : null;
  }

  async getAllProducts(filters?: { isActive?: boolean; category?: string }): Promise<ProductResponseDTO[]> {
    const products = await this.productRepository.findAll(filters);
    return products.map(product => this.mapToResponseDTO(product));
  }

  async getProductsByCategory(category: string): Promise<ProductResponseDTO[]> {
    const products = await this.productRepository.findByCategory(category);
    return products.map(product => this.mapToResponseDTO(product));
  }

  async updateProduct(id: number, data: UpdateProductDTO): Promise<ProductResponseDTO | null> {
    // Validação
    const errors = await validate(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => e.toString()).join(', ')}`);
    }

    const product = await this.productRepository.update(id, data);
    return product ? this.mapToResponseDTO(product) : null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return await this.productRepository.delete(id);
  }

  async updateStock(id: number, quantity: number): Promise<ProductResponseDTO | null> {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    const product = await this.productRepository.updateStock(id, quantity);
    return product ? this.mapToResponseDTO(product) : null;
  }

  private mapToResponseDTO(product: Product): ProductResponseDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }
}
```

### Passo 5: Criar Entidade de Banco de Dados

**Arquivo:** `src/infrastructure/database/entities/Product.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('products')
@Index(['category'])
@Index(['isActive'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

### Passo 6: Implementar o Repositório

**Arquivo:** `src/infrastructure/repositories/ProductRepository.ts`

```typescript
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { ProductEntity } from '../database/entities/Product';
import { Product } from '../../domain/entities/Product';
import { IProductRepository, CreateProductData, UpdateProductData } from '../../domain/interfaces/IProductRepository';

export class ProductRepository implements IProductRepository {
  private repository: Repository<ProductEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ProductEntity);
  }

  async create(data: CreateProductData): Promise<Product> {
    const productEntity = this.repository.create(data);
    const savedEntity = await this.repository.save(productEntity);
    return this.mapToDomainEntity(savedEntity);
  }

  async findById(id: number): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapToDomainEntity(entity) : null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    const entities = await this.repository.find({ 
      where: { category, isActive: true },
      order: { name: 'ASC' }
    });
    return entities.map(entity => this.mapToDomainEntity(entity));
  }

  async findAll(filters?: { isActive?: boolean; category?: string }): Promise<Product[]> {
    const queryBuilder = this.repository.createQueryBuilder('product');

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.category) {
      queryBuilder.andWhere('product.category = :category', { category: filters.category });
    }

    queryBuilder.orderBy('product.name', 'ASC');

    const entities = await queryBuilder.getMany();
    return entities.map(entity => this.mapToDomainEntity(entity));
  }

  async update(id: number, data: UpdateProductData): Promise<Product | null> {
    await this.repository.update(id, { ...data, updatedAt: new Date() });
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async updateStock(id: number, quantity: number): Promise<Product | null> {
    await this.repository.update(id, { stock: quantity, updatedAt: new Date() });
    return this.findById(id);
  }

  private mapToDomainEntity(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.name,
      entity.description,
      entity.price,
      entity.category,
      entity.stock,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt
    );
  }
}
```

### Passo 7: Criar o Controller

**Arquivo:** `src/presentation/controllers/ProductController.ts`

```typescript
import { Request, Response } from 'express';
import { ProductUseCases } from '../../application/usecases/ProductUseCases';
import { CreateProductDTO, UpdateProductDTO } from '../../application/dtos/ProductDTO';
import { AuditLogger } from '../../shared/utils/auditLogger';

export class ProductController {
  constructor(private productUseCases: ProductUseCases) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const createProductDTO: CreateProductDTO = req.body;
      const product = await this.productUseCases.createProduct(createProductDTO);

      AuditLogger.log('PRODUCT_CREATED', req.user?.userId, {
        productId: product.id,
        productName: product.name
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create product'
      });
    }
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { isActive, category } = req.query;
      const filters = {
        isActive: isActive ? isActive === 'true' : undefined,
        category: category as string
      };

      const products = await this.productUseCases.getAllProducts(filters);

      res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: products,
        count: products.length
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products'
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productUseCases.getProductById(parseInt(id));

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product'
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateProductDTO: UpdateProductDTO = req.body;
      
      const product = await this.productUseCases.updateProduct(parseInt(id), updateProductDTO);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      AuditLogger.log('PRODUCT_UPDATED', req.user?.userId, {
        productId: product.id,
        changes: updateProductDTO
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update product'
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.productUseCases.deleteProduct(parseInt(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      AuditLogger.log('PRODUCT_DELETED', req.user?.userId, {
        productId: parseInt(id)
      });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }

  async updateStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid quantity. Must be a non-negative number.'
        });
        return;
      }

      const product = await this.productUseCases.updateStock(parseInt(id), quantity);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found'
        });
        return;
      }

      AuditLogger.log('PRODUCT_STOCK_UPDATED', req.user?.userId, {
        productId: product.id,
        newQuantity: quantity
      });

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update stock'
      });
    }
  }
}
```

### Passo 8: Criar as Rotas

**Arquivo:** `src/presentation/routes/productRoutes.ts`

```typescript
import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { requireSuperUser } from '../middlewares/authorizationMiddleware';
import { apiRateLimit, sensitiveOperationsRateLimit } from '../middlewares/rateLimitMiddleware';
import { ControllerFactory } from '../../shared/container/ServiceRegistry';

const router = Router();
const productController = ControllerFactory.createProductController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *         stock:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Rotas públicas (produtos ativos)
router.get('/', apiRateLimit, productController.getAllProducts.bind(productController));
router.get('/:id', apiRateLimit, productController.getProductById.bind(productController));

// Rotas administrativas (requerem autenticação e permissões)
router.post('/', authenticateToken, requireSuperUser, sensitiveOperationsRateLimit, productController.createProduct.bind(productController));
router.put('/:id', authenticateToken, requireSuperUser, sensitiveOperationsRateLimit, productController.updateProduct.bind(productController));
router.delete('/:id', authenticateToken, requireSuperUser, sensitiveOperationsRateLimit, productController.deleteProduct.bind(productController));
router.patch('/:id/stock', authenticateToken, requireSuperUser, apiRateLimit, productController.updateStock.bind(productController));

export default router;
```

### Passo 9: Configurar Injeção de Dependência

**Atualizar:** `src/shared/container/ServiceRegistry.ts`

```typescript
// Adicionar ao arquivo existente

// Símbolos para identificação dos serviços
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  ProductRepository: Symbol.for('ProductRepository'), // NOVO
  
  // Use Cases
  UserUseCases: Symbol.for('UserUseCases'),
  ProductUseCases: Symbol.for('ProductUseCases'), // NOVO
  
  // Controllers
  UserController: Symbol.for('UserController'),
  ProductController: Symbol.for('ProductController'), // NOVO
} as const;

// Adicionar na função configureServices():
export function configureServices(): void {
  // ... configurações existentes ...

  // Registra o repositório de produtos como singleton
  container.registerSingleton<IProductRepository>(
    TYPES.ProductRepository,
    () => new ProductRepository()
  );

  // Registra os use cases de produtos como singleton
  container.registerSingleton<ProductUseCases>(
    TYPES.ProductUseCases,
    () => {
      const productRepository = container.resolve<IProductRepository>(TYPES.ProductRepository);
      return new ProductUseCases(productRepository);
    }
  );

  // Registra o controller de produtos
  container.register<ProductController>(
    TYPES.ProductController,
    () => {
      const productUseCases = container.resolve<ProductUseCases>(TYPES.ProductUseCases);
      return new ProductController(productUseCases);
    }
  );
}

// Adicionar na classe ControllerFactory:
export class ControllerFactory {
  static createUserController(): UserController {
    return container.resolve<UserController>(TYPES.UserController);
  }

  static createProductController(): ProductController { // NOVO
    return container.resolve<ProductController>(TYPES.ProductController);
  }
}
```

### Passo 10: Registrar as Rotas

**Atualizar:** `src/presentation/routes/index.ts`

```typescript
// Adicionar ao arquivo existente
import productRoutes from './productRoutes';

// Registrar a rota
router.use('/products', productRoutes);
```

### Passo 11: Atualizar Configuração do Banco

**Atualizar:** `src/infrastructure/database/data-source.ts`

```typescript
// Adicionar a nova entidade
import { ProductEntity } from './entities/Product';

// No array entities:
entities: [UserEntity, ProductEntity], // Adicionar ProductEntity
```

## 📝 Padrões e Convenções

### Nomenclatura
- **Entidades**: PascalCase (ex: `Product`, `User`)
- **Interfaces**: Prefixo `I` + PascalCase (ex: `IProductRepository`)
- **DTOs**: Sufixo `DTO` (ex: `CreateProductDTO`)
- **Use Cases**: Sufixo `UseCases` (ex: `ProductUseCases`)
- **Controllers**: Sufixo `Controller` (ex: `ProductController`)

### Estrutura de Arquivos
- Um arquivo por classe/interface
- Nomes de arquivo iguais ao nome da classe
- Organização por responsabilidade, não por tipo

### Validação
- Use `class-validator` nos DTOs
- Validações de negócio nas entidades
- Validações de entrada nos use cases

### Tratamento de Erros
- Erros específicos do domínio nas entidades
- Erros de validação nos use cases
- Erros HTTP nos controllers

## 🔧 Injeção de Dependência

### Princípios
1. **Inversão de Controle**: Classes não criam suas dependências
2. **Configuração Centralizada**: Todas as dependências configuradas em um local
3. **Singletons para Repositórios**: Evita múltiplas conexões
4. **Transientes para Controllers**: Nova instância por requisição

### Adicionando Novos Serviços
1. Definir símbolo em `TYPES`
2. Registrar no `configureServices()`
3. Criar factory se necessário
4. Usar `container.resolve()` para obter instâncias

## ✅ Checklist para Nova Entidade

- [ ] Entidade de domínio criada
- [ ] Interface do repositório definida
- [ ] DTOs criados com validações
- [ ] Use cases implementados
- [ ] Entidade de banco criada
- [ ] Repositório implementado
- [ ] Controller criado
- [ ] Rotas definidas
- [ ] Injeção de dependência configurada
- [ ] Rotas registradas no index
- [ ] Entidade adicionada ao data-source
- [ ] Testes criados (opcional)

## 🎯 Benefícios desta Arquitetura

1. **Testabilidade**: Fácil criação de mocks e testes unitários
2. **Manutenibilidade**: Mudanças isoladas por camada
3. **Escalabilidade**: Fácil adição de novas funcionalidades
4. **Flexibilidade**: Troca de tecnologias sem afetar regras de negócio
5. **Clareza**: Separação clara de responsabilidades

---

**Nota**: Este guia serve como base para implementação de qualquer nova entidade no projeto, mantendo a consistência e os princípios da Clean Architecture.