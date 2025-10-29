# 🔒 Padrões de Segurança Implementados - MestreDB Backend

## 📋 Visão Geral

Este documento detalha todas as medidas de segurança implementadas no MestreDB Backend, incluindo autenticação, autorização, proteção contra ataques, criptografia e configurações de segurança. O projeto segue as melhores práticas de segurança para aplicações web modernas.

## 🛡️ Arquitetura de Segurança

### Camadas de Proteção

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Cliente)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS/TLS
┌─────────────────────▼───────────────────────────────────────┐
│                 CORS + Headers                              │
├─────────────────────────────────────────────────────────────┤
│                 Rate Limiting                               │
├─────────────────────────────────────────────────────────────┤
│              Autenticação JWT                               │
├─────────────────────────────────────────────────────────────┤
│               Autorização RBAC                              │
├─────────────────────────────────────────────────────────────┤
│            Validação de Dados                               │
├─────────────────────────────────────────────────────────────┤
│              Criptografia bcrypt                            │
├─────────────────────────────────────────────────────────────┤
│                 Banco de Dados                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Sistema de Autenticação

### 1. JWT (JSON Web Tokens)

**Configuração:**
- **Access Token:** 15 minutos de duração
- **Refresh Token:** 7 dias de duração
- **Algoritmo:** HS256
- **Secret:** Configurável via `JWT_SECRET`

**Implementação:**
```typescript
// src/application/services/TokenService.ts
export class TokenService {
  generateTokenPair(payload: TokenPayload): TokenPair {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'mestredb-backend',
      audience: 'mestredb-frontend'
    });

    const refreshToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'mestredb-backend',
      audience: 'mestredb-frontend'
    });

    return { accessToken, refreshToken };
  }
}
```

### 2. Middleware de Autenticação

**Localização:** `src/presentation/middlewares/authMiddleware.ts`

**Funcionalidades:**
- Validação de formato Bearer Token
- Verificação de token na blacklist
- Decodificação e validação de JWT
- Injeção de dados do usuário no request

**Exemplo de Uso:**
```typescript
// Proteger rota
router.get('/me', authenticateToken, authController.me);

// Verificação no middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'Token de acesso requerido',
      message: 'Você precisa estar logado para acessar este recurso'
    });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  // Verificar blacklist
  if (tokenBlacklistService.isBlacklisted(token)) {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Token foi invalidado. Faça login novamente.'
    });
  }

  // Validar e decodificar
  const decoded = await authUseCases.validateToken(token);
  req.user = decoded;
  next();
};
```

### 3. Blacklist de Tokens

**Funcionalidade:**
- Invalidação de tokens no logout
- Prevenção de reutilização de tokens comprometidos
- Limpeza automática de tokens expirados

## 👥 Sistema de Autorização (RBAC)

### 1. Níveis de Acesso

**Usuário Normal:**
- Visualizar próprio perfil
- Editar próprio perfil
- Deletar própria conta

**Superusuário:**
- Todas as permissões de usuário normal
- Criar novos usuários
- Listar todos os usuários
- Editar qualquer usuário
- Deletar qualquer usuário (exceto própria conta)

### 2. Middlewares de Autorização

**Localização:** `src/presentation/middlewares/authorizationMiddleware.ts`

**Middlewares Disponíveis:**

```typescript
// Apenas superusuários
export const requireSuperUser = (req, res, next) => {
  if (!req.user.is_superuser) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas super usuários podem acessar este recurso'
    });
  }
  next();
};

// Próprio usuário ou superusuário
export const requireOwnershipOrSuperUser = (req, res, next) => {
  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user.userId;
  const isSuperUser = req.user.is_superuser;

  if (!isSuperUser && targetUserId !== currentUserId) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Você só pode acessar seus próprios dados'
    });
  }
  next();
};

// Proteção especial para deleção
export const requireOwnershipOrSuperUserForDeletion = (req, res, next) => {
  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user.userId;
  const isSuperUser = req.user.is_superuser;

  // Superusuário não pode deletar própria conta
  if (isSuperUser && targetUserId === currentUserId) {
    return res.status(403).json({
      error: 'Operação não permitida',
      message: 'Você não pode deletar sua própria conta'
    });
  }

  // Usuário normal só pode deletar própria conta
  if (!isSuperUser && targetUserId !== currentUserId) {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Você só pode deletar sua própria conta'
    });
  }

  next();
};
```

## 🚫 Proteção contra Ataques

### 1. Rate Limiting

**Implementação:** Sistema customizado de rate limiting

**Configuração:**
```env
RATE_LIMIT_MAX_ATTEMPTS=5      # Máximo de tentativas
RATE_LIMIT_WINDOW_MINUTES=15   # Janela de tempo
RATE_LIMIT_BLOCK_MINUTES=15    # Tempo de bloqueio
```

**Funcionalidades:**
- Rate limiting por IP + email
- Bloqueio temporário após exceder limite
- Limpeza automática de dados expirados
- Headers informativos nas respostas
- Endpoints de debug para administração

**Middleware:**
```typescript
// src/presentation/middlewares/customRateLimitMiddleware.ts
export class CustomRateLimitMiddleware {
  loginRateLimit = (req: Request, res: Response, next: NextFunction) => {
    const ip = this.getClientIP(req);
    const email = req.body?.email || '';
    const identifier = email ? `${ip}:${email}` : ip;

    const result = this.rateLimitingService.canAttempt(identifier);

    // Headers informativos
    res.set({
      'X-RateLimit-Limit': this.rateLimitingService.getConfig().maxAttempts.toString(),
      'X-RateLimit-Remaining': (result.attemptsLeft || 0).toString(),
      'X-RateLimit-Reset': result.remainingTime ? 
        new Date(Date.now() + (result.remainingTime * 1000)).toISOString() : 
        new Date().toISOString()
    });

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Muitas tentativas de login',
        message: `Tente novamente em ${result.remainingTime} segundos`,
        retryAfter: result.remainingTime,
        type: 'RATE_LIMIT_EXCEEDED'
      });
    }

    next();
  };
}
```

### 2. Proteção CORS

**Localização:** `src/presentation/middlewares/cors.ts`

**Configuração:**
```typescript
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;

  // Verificar origem permitida
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Métodos permitidos
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  // Headers permitidos
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  // Permitir credenciais
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Responder preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};
```

**Configuração de Ambiente:**
```env
# Desenvolvimento
CORS_ORIGIN=http://localhost:3000

# Múltiplas origens
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://mestredb.com

# Produção
CORS_ORIGIN=https://mestredb.com
```

### 3. Validação de Dados

**Biblioteca:** class-validator + ValidationService customizado

**Validações Implementadas:**

```typescript
// src/application/services/ValidationService.ts
export class ValidationService {
  // Validação de email
  validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, errors: ['Email deve ter um formato válido'] };
    }
    return { isValid: true, errors: [] };
  }

  // Validação de dados de login
  validateLoginData(data: LoginValidationData): ValidationResult {
    const errors: string[] = [];
    
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    const passwordValidation = this.validateRequired(data.password, 'Senha');
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validação de dados de registro
  validateRegisterData(data: RegisterValidationData): ValidationResult {
    const errors: string[] = [];
    
    // Validar nome (2-80 caracteres)
    const nameValidation = this.validateStringLength(data.name, 'Nome', 2, 80);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }

    // Validar email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Validar senha (mínimo 8 caracteres)
    const passwordValidation = this.validateStringLength(data.password, 'Senha', 8, 128);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    return { isValid: errors.length === 0, errors };
  }
}
```

### 4. Sanitização de Entrada

**Prevenção de Ataques:**
- **SQL Injection:** TypeORM com prepared statements
- **XSS:** Validação e sanitização de entrada
- **NoSQL Injection:** Validação de tipos TypeScript

## 🔒 Criptografia e Hashing

### 1. Criptografia de Senhas

**Algoritmo:** bcrypt com salt rounds configurável

**Implementação:**
```typescript
// src/application/services/PasswordService.ts
export class PasswordService {
  private readonly saltRounds: number = 12;

  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('Senha é obrigatória');
    }
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    return await bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Mínimo 8 caracteres
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }

    // Pelo menos um número
    if (!/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    // Pelo menos um caractere especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }

    // Pelo menos uma letra minúscula
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    return { isValid: errors.length === 0, errors };
  }
}
```

### 2. Configuração de Salt Rounds

**Recomendações:**
- **Desenvolvimento:** 10-12 rounds
- **Produção:** 12-14 rounds
- **Configurável:** Via construtor do PasswordService

## 🌐 Configurações de Rede e Headers

### 1. Headers de Segurança

**Headers Implementados:**
```typescript
// Rate limiting headers
res.set({
  'X-RateLimit-Limit': maxAttempts.toString(),
  'X-RateLimit-Remaining': attemptsLeft.toString(),
  'X-RateLimit-Reset': resetTime.toISOString()
});

// CORS headers
res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

### 2. Configuração HTTPS (Produção)

**Recomendações para Deploy:**
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name mestredb.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔧 Configurações de Ambiente

### 1. Variáveis de Segurança

**Arquivo .env:**
```env
# ===========================================
# CONFIGURAÇÕES DE AUTENTICAÇÃO JWT
# ===========================================
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_com_pelo_menos_32_caracteres
JWT_ACCESS_EXPIRES_IN=15m          # Token de acesso (15 minutos)
JWT_REFRESH_EXPIRES_IN=7d          # Token de refresh (7 dias)

# ===========================================
# CONFIGURAÇÕES DE CORS
# ===========================================
CORS_ORIGIN=http://localhost:3000  # URL do frontend

# ===========================================
# CONFIGURAÇÕES DE RATE LIMITING
# ===========================================
RATE_LIMIT_MAX_ATTEMPTS=5          # Máximo de tentativas por janela
RATE_LIMIT_WINDOW_MINUTES=15       # Janela de tempo em minutos
RATE_LIMIT_BLOCK_MINUTES=15        # Tempo de bloqueio em minutos

# ===========================================
# USUÁRIO ADMINISTRADOR PADRÃO
# ===========================================
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=admin123            # ALTERAR EM PRODUÇÃO!

# ===========================================
# CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=sua_senha_segura    # ALTERAR EM PRODUÇÃO!
MYSQL_DATABASE=mestredb_sql
```

### 2. Configurações por Ambiente

**Desenvolvimento:**
```env
NODE_ENV=development
JWT_SECRET=dev_secret_key_32_characters_minimum
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
RATE_LIMIT_MAX_ATTEMPTS=10         # Mais permissivo para testes
```

**Teste:**
```env
NODE_ENV=test
JWT_SECRET=test_secret_key_32_characters_minimum
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_ATTEMPTS=100        # Muito permissivo para testes automatizados
```

**Produção:**
```env
NODE_ENV=production
JWT_SECRET=production_super_secure_random_key_with_64_characters_minimum
CORS_ORIGIN=https://mestredb.com
RATE_LIMIT_MAX_ATTEMPTS=3          # Mais restritivo em produção
RATE_LIMIT_WINDOW_MINUTES=30       # Janela maior
RATE_LIMIT_BLOCK_MINUTES=60        # Bloqueio mais longo
```

## 📊 Monitoramento e Auditoria

### 1. Logs de Segurança

**Eventos Logados:**
```typescript
// Login bem-sucedido
console.log(`✅ Login bem-sucedido para ${email} de ${ip}`);

// Login falhado
console.log(`❌ Tentativa de login falhada para ${email} de ${ip}: ${error}`);

// Rate limit excedido
console.log(`🚫 Rate limit excedido para ${identifier}. Bloqueado por ${remainingTime}s`);

// Token invalidado
console.log(`🔒 Token invalidado no logout para usuário ${userId}`);

// Operações administrativas
console.log(`👑 Operação administrativa: ${action} por usuário ${adminId}`);
```

### 2. Métricas de Segurança

**Métricas Recomendadas:**
- Taxa de sucesso/falha de login
- Tentativas de força bruta por IP
- Tokens invalidados por período
- Operações administrativas
- Tentativas de acesso não autorizado

### 3. Alertas de Segurança

**Situações para Alertas:**
- Múltiplas tentativas de login falhadas
- Tentativas de acesso com tokens inválidos
- Operações administrativas sensíveis
- Picos de tráfego suspeitos

## 🛠️ Ferramentas de Debug e Administração

### 1. Endpoints de Debug (Rate Limiting)

**Verificar Status:**
```bash
GET /api/auth/rate-limit/status
Authorization: Bearer <admin_token>

# Resposta
{
  "activeAttempts": 5,
  "blockedIdentifiers": 2,
  "config": {
    "maxAttempts": 5,
    "windowMinutes": 15,
    "blockMinutes": 15
  }
}
```

**Reset Manual:**
```bash
POST /api/auth/rate-limit/reset
Authorization: Bearer <admin_token>

# Resposta
{
  "message": "Rate limiting data reset successfully",
  "clearedAttempts": 10,
  "clearedBlocks": 3
}
```

### 2. Comandos de Diagnóstico

```bash
# Verificar configurações de segurança
npm run security:check

# Testar rate limiting
npm run test:rate-limit

# Verificar força de senhas
npm run test:password-strength

# Auditoria de dependências
npm audit

# Verificar vulnerabilidades
npm audit fix
```

## 🚨 Procedimentos de Emergência

### 1. Comprometimento de JWT Secret

**Passos:**
1. Gerar novo JWT_SECRET
2. Atualizar variável de ambiente
3. Reiniciar aplicação
4. Invalidar todos os tokens existentes
5. Notificar usuários para novo login

### 2. Ataque de Força Bruta Detectado

**Passos:**
1. Verificar logs de rate limiting
2. Identificar IPs suspeitos
3. Reduzir temporariamente RATE_LIMIT_MAX_ATTEMPTS
4. Considerar bloqueio de IP no firewall
5. Monitorar atividade

### 3. Vazamento de Dados Suspeito

**Passos:**
1. Verificar logs de acesso
2. Identificar operações suspeitas
3. Invalidar tokens de usuários afetados
4. Forçar reset de senhas se necessário
5. Investigar origem do vazamento

## ✅ Checklist de Segurança

### Configuração Inicial
- [ ] JWT_SECRET configurado com pelo menos 32 caracteres
- [ ] CORS_ORIGIN configurado corretamente
- [ ] Rate limiting ativado
- [ ] Senha do admin alterada
- [ ] Senha do banco de dados segura

### Autenticação e Autorização
- [ ] Middleware de autenticação funcionando
- [ ] Middlewares de autorização aplicados
- [ ] Blacklist de tokens implementada
- [ ] Refresh tokens funcionando

### Proteção contra Ataques
- [ ] Rate limiting testado
- [ ] CORS configurado corretamente
- [ ] Validação de dados implementada
- [ ] Sanitização de entrada ativa

### Criptografia
- [ ] bcrypt configurado com salt rounds adequados
- [ ] Validação de força de senha implementada
- [ ] Senhas nunca logadas ou expostas

### Monitoramento
- [ ] Logs de segurança configurados
- [ ] Métricas de segurança coletadas
- [ ] Alertas de segurança configurados

### Produção
- [ ] HTTPS configurado
- [ ] Headers de segurança implementados
- [ ] Variáveis de ambiente seguras
- [ ] Backup e recovery testados

## 📚 Recursos Adicionais

### Documentação de Referência
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8725
- **bcrypt Documentation:** https://github.com/kelektiv/node.bcrypt.js
- **Express Security:** https://expressjs.com/en/advanced/best-practice-security.html

### Ferramentas de Segurança
- **npm audit:** Auditoria de dependências
- **Snyk:** Análise de vulnerabilidades
- **OWASP ZAP:** Teste de penetração
- **Burp Suite:** Análise de segurança web

### Próximos Passos
1. **Implementar Helmet.js** para headers de segurança adicionais
2. **Configurar CSP** (Content Security Policy)
3. **Implementar 2FA** (Two-Factor Authentication)
4. **Adicionar logging estruturado** com Winston
5. **Configurar monitoramento** com Prometheus/Grafana

---

## 🎯 Conclusão

O MestreDB Backend implementa um conjunto robusto de medidas de segurança que protegem contra as principais ameaças de segurança web. A arquitetura em camadas garante que múltiplas linhas de defesa estejam em vigor, desde a validação de entrada até a criptografia de dados sensíveis.

**Principais Forças:**
- ✅ Autenticação JWT robusta com refresh tokens
- ✅ Sistema de autorização baseado em papéis (RBAC)
- ✅ Proteção contra ataques de força bruta
- ✅ Criptografia forte de senhas com bcrypt
- ✅ Validação abrangente de dados de entrada
- ✅ Configuração CORS adequada
- ✅ Logs de auditoria detalhados

**Recomendações para Produção:**
- Implementar HTTPS com certificados válidos
- Configurar headers de segurança adicionais
- Estabelecer monitoramento e alertas
- Realizar auditorias de segurança regulares
- Manter dependências atualizadas

Este documento serve como guia completo para entender, manter e aprimorar a segurança do MestreDB Backend, garantindo que a aplicação permaneça segura e confiável em todos os ambientes de deployment.