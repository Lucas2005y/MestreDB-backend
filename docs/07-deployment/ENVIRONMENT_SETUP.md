# 🌍 Configuração de Ambientes - MestreDB Backend

## 📋 Visão Geral

O projeto agora suporta múltiplos ambientes com configurações separadas:

- **Development** (`.env.development`) - Desenvolvimento local
- **Test** (`.env.test`) - Testes automatizados
- **Production** (`.env.production`) - Servidor de produção

## 🚀 Como Usar

### Desenvolvimento Local

```bash
# Modo desenvolvimento (usa .env.development)
npm run dev

# Ou build + start em modo dev
npm run build
npm run start:dev
```

### Testes

```bash
# Executar testes (usa .env.test)
npm test

# Testes em modo watch
npm run test:watch

# Testes com coverage
npm run test:coverage
```

### Produção

```bash
# Build
npm run build

# Iniciar em produção (usa .env.production)
npm start
```

## 📁 Arquivos de Ambiente

### `.env.development` ✅ Pode commitar
Configurações para desenvolvimento local:
- MySQL na porta 3307 (Docker)
- JWT secret simples
- Rate limiting permissivo
- Logs detalhados

### `.env.test` ✅ Pode commitar
Configurações para testes automatizados:
- Porta diferente (3001)
- JWT secret específico para testes
- Rate limiting muito permissivo
- SQLite em memória (configurado no Jest)

### `.env.production` ❌ NUNCA commitar
Configurações para servidor de produção:
- Credenciais reais do MySQL
- JWT secret forte (64+ caracteres)
- Rate limiting restritivo
- Logs de produção

### `.env.example` ✅ Pode commitar
Template de referência para novos desenvolvedores

### `.env` (opcional) ✅ Pode commitar
Fallback para compatibilidade com setup antigo

## 🔒 Segurança

### Arquivos Protegidos no .gitignore

```gitignore
.env                    # Fallback genérico
.env.production         # CRÍTICO: Nunca commitar!
.env.production.local
```

### Arquivos Commitados (seguros)

```
.env.development        # Sem senhas reais
.env.test              # Sem senhas reais
.env.example           # Template
```

## 🛠️ Configuração Inicial

### Para Novos Desenvolvedores

1. Clone o repositório
2. Os arquivos `.env.development` e `.env.test` já estão prontos
3. Execute `npm install`
4. Execute `npm run dev`

### Para Deploy em Produção

1. Copie `.env.production` para o servidor
2. Edite com credenciais reais:
   ```bash
   nano .env.production
   ```
3. Gere JWT_SECRET forte:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. Configure MySQL, CORS, senhas
5. Execute:
   ```bash
   npm run build
   npm start
   ```

## 🔍 Como Funciona

### Carregamento Automático

O sistema carrega automaticamente o arquivo correto baseado em `NODE_ENV`:

```typescript
// src/infrastructure/config/environment.ts
NODE_ENV=development → carrega .env.development
NODE_ENV=test        → carrega .env.test
NODE_ENV=production  → carrega .env.production
Sem NODE_ENV         → carrega .env (fallback)
```

### Ordem de Prioridade

1. Variáveis de ambiente do sistema (mais alta)
2. `.env.{NODE_ENV}` (específico do ambiente)
3. `.env` (fallback)

## ✅ Verificação

### Testar se está funcionando

```bash
# Desenvolvimento
npm run dev
# Deve mostrar: ✅ Ambiente carregado: development (.env.development)

# Testes
npm test
# Deve mostrar: ✅ Ambiente carregado: test (.env.test)
```

### Verificar variáveis carregadas

```bash
# No código
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 10) + '...');
```

## 🐛 Troubleshooting

### Problema: Aplicação não inicia

**Solução:** Verificar se NODE_ENV está definido
```bash
# Windows CMD
set NODE_ENV=development

# Windows PowerShell
$env:NODE_ENV="development"

# Linux/Mac
export NODE_ENV=development
```

### Problema: Usando configuração errada

**Solução:** Verificar qual arquivo está sendo carregado
```bash
# Olhar logs no console ao iniciar
🔍 Tentando carregar: .env.development
✅ Ambiente carregado: development (.env.development)
```

### Problema: Variáveis não carregam

**Solução:** Verificar se arquivo existe
```bash
# Windows
dir .env*

# Linux/Mac
ls -la .env*
```

## 📚 Referências

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [cross-env Documentation](https://github.com/kentcdodds/cross-env)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)

---

**Última atualização:** 2025-01-10
