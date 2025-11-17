# 🔒 Segurança

## 📋 Medidas Implementadas

### 1. Autenticação JWT
- Access token (1h)
- Refresh token (7d)
- Token blacklist

### 2. Criptografia
- bcrypt (12 salt rounds)
- Senhas nunca expostas

### 3. Rate Limiting
- **Global**: Proteção geral
- **Login**: 5 tentativas/15min por IP+email
- **Headers**: X-RateLimit-*

### 4. CORS
- Origens configuráveis
- Credenciais permitidas
- Métodos específicos

### 5. Validação
- class-validator nos DTOs
- Sanitização de entrada
- TypeScript type safety

---

## 🛡️ Rate Limiting

### Configuração

```env
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_BLOCK_MINUTES=15
```

### Endpoints Protegidos

- POST /api/auth/login (5/15min)
- POST /api/auth/register (10/15min)
- Todos os outros (100/15min)

### Headers de Resposta

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2025-01-10T15:30:00Z
```

---

## 🔐 Validação de Senhas

### Regras
- Mínimo 8 caracteres
- Pelo menos 1 número
- Pelo menos 1 caractere especial
- Pelo menos 1 letra minúscula
- Pelo menos 1 letra maiúscula

---

## ⚠️ Variáveis Sensíveis

### Desenvolvimento
```env
JWT_SECRET=dev_secret_key_min_32_chars
ADMIN_PASSWORD=MinhaSenh@123
```

### Produção
```env
JWT_SECRET=<64+ caracteres aleatórios>
ADMIN_PASSWORD=<senha forte e única>
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📚 Referências

- [Guia Completo](../../CleanArchitectureGuide/05-Padroes-Seguranca-Implementados.md)
- [Rate Limiting](../../CleanArchitectureGuide/RATE_LIMITING_IMPLEMENTATION.md)
- [Authentication](./AUTHENTICATION.md)
