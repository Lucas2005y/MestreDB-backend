# 🏭 Main Layer - Factory Pattern

## 📋 Visão Geral

Camada de inicialização usando **Factory Pattern**.

**Localização:** `src/main/`

---

## 📁 Estrutura

```
src/main/
├── factories/             # Factories
│   ├── AppFactory.ts
│   ├── MiddlewareFactory.ts
│   ├── RouteFactory.ts
│   └── ServerFactory.ts
├── app.ts                 # App config
├── bootstrap.ts           # Inicialização
└── server.ts              # Servidor
```

---

## 🏭 Factories

### AppFactory

```typescript
// src/main/factories/AppFactory.ts
export class AppFactory {
  static create(): Express {
    const app = express();

    MiddlewareFactory.configureGlobalMiddlewares(app);
    RouteFactory.configureRoutes(app);
    MiddlewareFactory.configureErrorHandling(app);

    return app;
  }
}
```

### MiddlewareFactory

```typescript
// src/main/factories/MiddlewareFactory.ts
export class MiddlewareFactory {
  static configureGlobalMiddlewares(app: Express): void {
    app.use(cors(corsOptions));
    app.use(rateLimitMiddleware);
    app.use(express.json());
    app.use(requestLoggingMiddleware);
  }
}
```

### ServerFactory

```typescript
// src/main/factories/ServerFactory.ts
export class ServerFactory {
  static create(): Server {
    const app = AppFactory.create();
    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    this.configureGracefulShutdown(server);
    return server;
  }
}
```

---

## 🚀 Bootstrap

```typescript
// src/main/bootstrap.ts
export async function bootstrap(): Promise<void> {
  // 1. Carregar ambiente
  loadEnvironment();

  // 2. Validar variáveis
  validateEnvironment();

  // 3. Configurar DI
  const { configureServices } = await import('../shared/container/ServiceRegistry');
  configureServices();
}
```

---

## ✅ Benefícios

- ✅ Configuração centralizada
- ✅ Fácil de testar
- ✅ Reutilizável
- ✅ Consistente

---

## 📚 Referências

- [Factory Pattern Guide](../../CleanArchitectureGuide/06-Factory-Pattern-Implementation.md)
- [Presentation Layer](./PRESENTATION_LAYER.md)
