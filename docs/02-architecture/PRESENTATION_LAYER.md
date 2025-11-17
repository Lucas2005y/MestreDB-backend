# 🌐 Presentation Layer

## 📋 Visão Geral

Interface HTTP com o mundo externo.

**Localização:** `src/presentation/`

---

## 📁 Estrutura

```
src/presentation/
├── controllers/           # Controllers HTTP
│   ├── UserController.ts
│   └── AuthController.ts
├── routes/                # Rotas
│   ├── userRoutes.ts
│   ├── authRoutes.ts
│   └── index.ts
└── middlewares/           # Middlewares
    ├── authMiddleware.ts
    ├── rateLimitMiddleware.ts
    └── errorMiddleware.ts
```

---

## 🎮 Controllers

```typescript
// src/presentation/controllers/UserController.ts
export class UserController {
  constructor(private userUseCases: UserUseCases) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userUseCases.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message,
          errors: error.details
        });
      }
    }
  }
}
```

**Responsabilidades:**
- Receber requisições HTTP
- Validar entrada
- Chamar use cases
- Formatar respostas

---

## 🛣️ Routes

```typescript
// src/presentation/routes/userRoutes.ts
const router = Router();

router.post('/usuarios',
  authenticateToken,
  requireSuperUser,
  userController.createUser
);

router.get('/usuarios',
  authenticateToken,
  requireSuperUser,
  userController.getAllUsers
);

export default router;
```

---

## 🛡️ Middlewares

### Authentication

```typescript
// src/presentation/middlewares/authMiddleware.ts
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.substring(7);

  if (!token) {
    return res.status(401).json({
      error: 'Token requerido'
    });
  }

  const decoded = await authUseCases.validateToken(token);
  req.user = decoded;
  next();
};
```

### Authorization

```typescript
export const requireSuperUser = (req, res, next) => {
  if (!req.user.is_superuser) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }
  next();
};
```

---

## ✅ Regras

### PODE:
✅ Usar Express
✅ Chamar use cases
✅ Formatar respostas HTTP

### NÃO PODE:
❌ Acessar repositórios diretamente
❌ Conhecer detalhes de banco
❌ Ter lógica de negócio

---

## 📚 Referências

- [Application Layer](./APPLICATION_LAYER.md)
- [Main Layer](./MAIN_LAYER.md)
