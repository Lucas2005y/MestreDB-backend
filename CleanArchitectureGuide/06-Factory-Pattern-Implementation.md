# Factory Pattern Implementation - MestreDB Backend

## 📋 Visão Geral

Este documento detalha a implementação do Factory Pattern no projeto MestreDB Backend, explicando como os factories são utilizados para criar e configurar componentes da aplicação de forma padronizada e centralizada.

## 🏭 O que é Factory Pattern?

O Factory Pattern é um padrão de design criacional que fornece uma interface para criar objetos sem especificar suas classes concretas. No contexto do MestreDB Backend, utilizamos factories para:

- **Centralizar configuração** da aplicação
- **Padronizar criação** de componentes
- **Facilitar manutenção** e testes
- **Garantir consistência** na inicialização

## 🏗️ Arquitetura dos Factories

```
┌─────────────────────────────────────────────────────────────┐
│                      MAIN LAYER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   AppFactory    │  │ MiddlewareFactory│  │RouteFactory │ │
│  │   (Principal)   │  │  (Middlewares)  │  │   (Rotas)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                     │                   │       │
│           ▼                     ▼                   ▼       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  ServerFactory  │  │   DIContainer   │  │ServiceRegistry│ │
│  │   (Servidor)    │  │ (Dependencies)  │  │ (Services)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estrutura dos Factories

```
src/main/factories/
├── AppFactory.ts           # Factory principal da aplicação
├── MiddlewareFactory.ts    # Factory de middlewares
├── RouteFactory.ts         # Factory de rotas
└── ServerFactory.ts        # Factory do servidor
```

## 🔧 Implementação Detalhada

### 1. AppFactory - Factory Principal

O `AppFactory` é o ponto central de criação da aplicação Express, coordenando todos os outros factories.

```typescript
// src/main/factories/AppFactory.ts
import express, { Express } from 'express';
import { MiddlewareFactory } from './MiddlewareFactory';
import { RouteFactory } from './RouteFactory';

export class AppFactory {
  /**
   * Cria e configura a aplicação Express
   * @returns Instância configurada do Express
   */
  static create(): Express {
    const app = express();
    
    // 1. Configurar middlewares globais
    MiddlewareFactory.configureGlobalMiddlewares(app);
    
    // 2. Configurar rotas
    RouteFactory.configureRoutes(app);
    
    // 3. Configurar tratamento de erros (deve ser por último)
    MiddlewareFactory.configureErrorHandling(app);
    
    return app;
  }
}
```

**Responsabilidades:**
- Criar instância do Express
- Coordenar configuração de middlewares
- Coordenar configuração de rotas
- Garantir ordem correta de inicialização

### 2. MiddlewareFactory - Factory de Middlewares

O `MiddlewareFactory` centraliza toda configuração de middlewares da aplicação.

```typescript
// src/main/factories/MiddlewareFactory.ts
import { Express } from 'express';
import cors from 'cors';
import express from 'express';
import { rateLimitMiddleware } from '../../presentation/middlewares/rateLimitMiddleware';
import { customRateLimitMiddleware } from '../../presentation/middlewares/customRateLimitMiddleware';
import { errorHandler } from '../../presentation/middlewares/errorHandler';
import { setupSwagger } from '../../infrastructure/config/swagger';

export class MiddlewareFactory {
  /**
   * Configura middlewares globais da aplicação
   * @param app Instância do Express
   */
  static configureGlobalMiddlewares(app: Express): void {
    // CORS - Configuração de origens permitidas
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
    
    // Rate Limiting - Proteção contra spam
    app.use(rateLimitMiddleware);
    app.use(customRateLimitMiddleware);
    
    // Parsing de requisições
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));
    
    // Logging de requisições
    app.use(this.requestLoggingMiddleware);
    
    // Documentação Swagger
    this.configureSwagger(app);
  }
  
  /**
   * Configura tratamento de erros (deve ser chamado por último)
   * @param app Instância do Express
   */
  static configureErrorHandling(app: Express): void {
    app.use(errorHandler);
  }
  
  /**
   * Configura documentação Swagger
   * @param app Instância do Express
   */
  private static configureSwagger(app: Express): void {
    setupSwagger(app);
  }
  
  /**
   * Middleware de logging de requisições
   */
  private static requestLoggingMiddleware = (req: any, res: any, next: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  };
}
```

**Responsabilidades:**
- Configurar CORS
- Configurar rate limiting
- Configurar parsing de dados
- Configurar logging
- Configurar documentação
- Configurar tratamento de erros

### 3. RouteFactory - Factory de Rotas

O `RouteFactory` gerencia toda configuração de rotas da aplicação.

```typescript
// src/main/factories/RouteFactory.ts
import { Express } from 'express';

export class RouteFactory {
  /**
   * Configura todas as rotas da aplicação
   * @param app Instância do Express
   */
  static configureRoutes(app: Express): void {
    // Rota raiz - Health check
    app.get('/', (req, res) => {
      res.json({
        message: 'MestreDB API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    // Configurar rotas da API
    this.configureApiRoutes(app);
  }
  
  /**
   * Configura rotas da API (carregamento dinâmico)
   * @param app Instância do Express
   */
  private static async configureApiRoutes(app: Express): Promise<void> {
    try {
      const routes = await import('../../presentation/routes');
      app.use('/api', routes.default);
    } catch (error) {
      console.error('Erro ao carregar rotas da API:', error);
      throw error;
    }
  }
}
```

**Responsabilidades:**
- Configurar rota raiz
- Configurar health checks
- Carregar rotas da API dinamicamente
- Tratar erros de carregamento

### 4. ServerFactory - Factory do Servidor

O `ServerFactory` cria e configura o servidor HTTP com graceful shutdown.

```typescript
// src/main/factories/ServerFactory.ts
import { Server } from 'http';
import { AppDataSource } from '../../infrastructure/config/database';
import { AppFactory } from './AppFactory';

export class ServerFactory {
  /**
   * Cria e inicia o servidor HTTP
   * @returns Instância do servidor HTTP
   */
  static create(): Server {
    const app = AppFactory.create();
    const port = process.env.PORT || 3000;
    
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${port}/health`);
    });
    
    // Configurar graceful shutdown
    this.configureGracefulShutdown(server);
    
    return server;
  }
  
  /**
   * Configura encerramento gracioso do servidor
   * @param server Instância do servidor HTTP
   */
  private static configureGracefulShutdown(server: Server): void {
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed.');
        
        try {
          // Fechar conexão com banco de dados
          await AppDataSource.destroy();
          console.log('Database connection closed.');
          
          // Encerrar processo
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Forçar encerramento após timeout
      setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Escutar sinais de encerramento
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon
  }
}
```

**Responsabilidades:**
- Criar servidor HTTP
- Configurar porta
- Implementar graceful shutdown
- Gerenciar conexões de banco
- Tratar sinais do sistema

## 🔄 Fluxo de Inicialização

```
1. ServerFactory.create()
   ↓
2. AppFactory.create()
   ↓
3. MiddlewareFactory.configureGlobalMiddlewares()
   ├── CORS
   ├── Rate Limiting
   ├── Parsing
   ├── Logging
   └── Swagger
   ↓
4. RouteFactory.configureRoutes()
   ├── Root routes
   ├── Health checks
   └── API routes (dynamic import)
   ↓
5. MiddlewareFactory.configureErrorHandling()
   ↓
6. Server.listen()
   ↓
7. Graceful shutdown configuration
```

## ✅ Benefícios da Implementação

### 1. **Configuração Centralizada**
- Toda configuração em um local específico
- Fácil localização de configurações
- Redução de código duplicado

### 2. **Ordem de Inicialização Garantida**
- Middlewares aplicados na ordem correta
- Tratamento de erros por último
- Dependências resolvidas adequadamente

### 3. **Testabilidade Aprimorada**
- Factories podem ser mockados facilmente
- Testes unitários isolados
- Configuração específica para testes

### 4. **Manutenibilidade**
- Mudanças centralizadas
- Impacto reduzido em alterações
- Código mais limpo e organizado

### 5. **Flexibilidade**
- Fácil adição de novos middlewares
- Configuração condicional por ambiente
- Extensibilidade sem quebrar funcionalidades

## 🧪 Testando os Factories

### Exemplo de Teste do AppFactory

```typescript
// tests/factories/AppFactory.test.ts
import request from 'supertest';
import { AppFactory } from '../../src/main/factories/AppFactory';

describe('AppFactory', () => {
  let app: Express;
  
  beforeEach(() => {
    app = AppFactory.create();
  });
  
  it('should create Express app with basic configuration', () => {
    expect(app).toBeDefined();
  });
  
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
      
    expect(response.body.status).toBe('healthy');
  });
  
  it('should have CORS configured', async () => {
    const response = await request(app)
      .options('/api/usuarios')
      .expect(200);
      
    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
```

## 📚 Próximos Passos

1. **Implementar Factory para Testes**: Criar configuração específica para ambiente de testes
2. **Adicionar Métricas**: Implementar coleta de métricas nos factories
3. **Configuração por Ambiente**: Expandir configurações específicas por ambiente
4. **Factory de Database**: Criar factory específico para configuração de banco
5. **Factory de Cache**: Implementar factory para configuração de cache

## 🔗 Referências

- [Factory Pattern - Gang of Four](https://refactoring.guru/design-patterns/factory-method)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Graceful Shutdown](https://nodejs.org/api/process.html#process_signal_events)

---

Esta implementação do Factory Pattern garante uma arquitetura robusta, testável e facilmente mantível para o MestreDB Backend.