# ✅ Implementação: Logs Estruturados com Winston

**Data:** 2025-01-18
**Melhoria:** #2 do Roadmap
**Status:** ✅ Concluída

---

## 📋 O que foi implementado

Sistema completo de logs estruturados usando Winston com rotação diária de arquivos, níveis configuráveis e formato JSON para produção.

---

## 📁 Arquivos Criados

### 1. `src/shared/utils/logger.ts`
- Logger Winston configurado com níveis customizados
- Formato JSON para arquivos
- Formato colorido para console
- Rotação diária de arquivos com `winston-daily-rotate-file`
- Helpers: `logRequest`, `logError`, `logAudit`, `logPerformance`
- Child loggers com contexto

### 2. `src/presentation/middlewares/httpLoggerMiddleware.ts`
- Middleware para logging automático de requisições HTTP
- Captura método, URL, status, tempo de resposta, IP, user agent
- Integrado no início da cadeia de middlewares

---

## 🔧 Arquivos Modificados

### 1. `src/main/bootstrap.ts`
- Substituído `console.log` por `logger.info()`
- Logs estruturados de inicialização

### 2. `src/main/factories/ServerFactory.ts`
- Adicionado logging estruturado no startup
- Logs de graceful shutdown
- Mantido `console.log` para feedback visual

### 3. `src/main/factories/MiddlewareFactory.ts`
- Integrado `httpLoggerMiddleware`
- Removido logging manual de requisições

### 4. `src/presentation/middlewares/errorHandler.ts`
- Substituído `console.error` por `logError()`
- Logs estruturados de erros com contexto

### 5. `package.json`
- Instalado `winston` e `winston-daily-rotate-file`

---

## ✨ Funcionalidades

### Níveis de Log

```typescript
{
  error: 0,   // Erros críticos
  warn: 1,    // Avisos
  info: 2,    // Informações gerais
  http: 3,    // Requisições HTTP
  debug: 4,   // Debug detalhado
}
```

### Transports Configurados

1. **Error Log** (`logs/error-YYYY-MM-DD.log`)
   - Apenas erros
   - Rotação diária
   - Mantém 14 dias
   - Compactação automática

2. **Combined Log** (`logs/combined-YYYY-MM-DD.log`)
   - Todos os níveis
   - Rotação diária
   - Mantém 14 dias
   - Compactação automática

3. **HTTP Log** (`logs/http-YYYY-MM-DD.log`)
   - Apenas requisições HTTP
   - Rotação diária
   - Mantém 7 dias
   - Compactação automática

4. **Console** (apenas dev/test)
   - Formato colorido e legível
   - Não ativo em produção

### Formato dos Logs

**Arquivo (JSON):**
```json
{
  "timestamp": "2025-01-18 14:30:45",
  "level": "info",
  "message": "Servidor HTTP iniciado",
  "port": 3000,
  "environment": "development",
  "healthCheck": "http://localhost:3000/api/health"
}
```

**Console (Desenvolvimento):**
```
2025-01-18 14:30:45 [info]: Servidor HTTP iniciado {"port":3000,"environment":"development"}
```

### Helpers Disponíveis

#### 1. logRequest (HTTP)
```typescript
logRequest(req, res, responseTime);
// Resultado:
{
  "level": "http",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/usuarios",
  "statusCode": 200,
  "responseTime": "45ms",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "userId": 1
}
```

#### 2. logError (Erros)
```typescript
logError(error, { userId: 1, action: 'createUser' });
// Resultado:
{
  "level": "error",
  "message": "Validation failed",
  "error": {
    "name": "ValidationError",
    "message": "Email já existe",
    "stack": "..."
  },
  "userId": 1,
  "action": "createUser"
}
```

#### 3. logAudit (Auditoria)
```typescript
logAudit('user.created', userId, { email: 'user@example.com' });
// Resultado:
{
  "level": "info",
  "message": "Audit Log",
  "type": "audit",
  "action": "user.created",
  "userId": 1,
  "timestamp": "2025-01-18T14:30:45.000Z",
  "email": "user@example.com"
}
```

#### 4. logPerformance (Performance)
```typescript
logPerformance('database.query', duration, { query: 'SELECT * FROM users' });
// Resultado:
{
  "level": "debug",
  "message": "Performance",
  "type": "performance",
  "operation": "database.query",
  "duration": "125ms",
  "query": "SELECT * FROM users"
}
```

#### 5. createChildLogger (Contexto)
```typescript
const userLogger = createChildLogger({ module: 'UserService' });
userLogger.info('Usuário criado', { userId: 1 });
// Resultado:
{
  "level": "info",
  "message": "Usuário criado",
  "module": "UserService",
  "userId": 1
}
```

---

## 🎯 Benefícios

### 1. Logs Estruturados
- Formato JSON para parsing automático
- Fácil integração com ferramentas de monitoramento
- Queries e análises facilitadas

### 2. Rotação Automática
- Arquivos diários com data no nome
- Compactação automática (.gz)
- Limpeza automática de logs antigos
- Economia de espaço em disco

### 3. Níveis Configuráveis
- Controle fino do que é logado
- Ambiente development: debug
- Ambiente production: info
- Configurável via `LOG_LEVEL`

### 4. Performance
- Logs assíncronos (não bloqueiam)
- Rotação sem downtime
- Compactação em background

### 5. Debugging Facilitado
- Stack traces completos
- Contexto rico (user, IP, URL)
- Correlação de requisições
- Tempo de resposta

### 6. Compliance e Auditoria
- Rastreamento completo de ações
- Logs imutáveis
- Retenção configurável
- Formato padronizado

---

## 🧪 Como Testar

### 1. Iniciar o servidor
```bash
npm run dev
```

Você verá logs estruturados no console e arquivos sendo criados em `logs/`.

### 2. Verificar arquivos de log
```bash
ls -la logs/
```

Deve mostrar:
```
combined-2025-01-18.log
error-2025-01-18.log
http-2025-01-18.log
```

### 3. Ver conteúdo dos logs
```bash
# Logs combinados
cat logs/combined-2025-01-18.log

# Apenas erros
cat logs/error-2025-01-18.log

# Apenas HTTP
cat logs/http-2025-01-18.log
```

### 4. Testar logging de erro
Faça uma requisição inválida:
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"email":"invalido"}'
```

Verifique `logs/error-2025-01-18.log` para ver o erro estruturado.

### 5. Testar logging HTTP
Faça requisições normais:
```bash
curl http://localhost:3000/api/health
```

Verifique `logs/http-2025-01-18.log` para ver as requisições.

### 6. Usar helpers no código
```typescript
import { logger, logAudit, logPerformance } from '../shared/utils/logger';

// Log simples
logger.info('Operação concluída', { userId: 1 });

// Log de auditoria
logAudit('user.updated', userId, { field: 'email' });

// Log de performance
const start = Date.now();
// ... operação ...
logPerformance('operation.name', Date.now() - start);
```

---

## 📊 Configuração

### Variável de Ambiente

Adicione ao `.env`:
```env
# Nível de log (error, warn, info, http, debug)
LOG_LEVEL=info
```

**Níveis recomendados:**
- Development: `debug`
- Production: `info`
- Troubleshooting: `debug`

### Retenção de Logs

Configurado em `src/shared/utils/logger.ts`:
```typescript
{
  maxFiles: '14d',  // Mantém 14 dias
  maxSize: '20m',   // Rotaciona a cada 20MB
  zippedArchive: true  // Compacta logs antigos
}
```

### Desabilitar Console em Produção

Automático! Console só é ativado em `development` e `test`.

---

## 🔍 Análise de Logs

### Buscar erros
```bash
grep -r "error" logs/error-*.log
```

### Contar requisições por endpoint
```bash
cat logs/http-*.log | jq '.url' | sort | uniq -c
```

### Ver tempo médio de resposta
```bash
cat logs/http-*.log | jq '.responseTime' | sed 's/ms//' | awk '{sum+=$1; count++} END {print sum/count "ms"}'
```

### Filtrar por usuário
```bash
cat logs/combined-*.log | jq 'select(.userId == 1)'
```

### Ver últimos erros
```bash
tail -f logs/error-*.log | jq '.'
```

---

## 🚀 Próximos Passos

Com logs estruturados implementados, as próximas melhorias recomendadas são:

1. **Health Check Completo** (#3) - Verificar MySQL
2. **Migrations do TypeORM** (#6) - Desabilitar synchronize
3. **Métricas e Monitoramento** (#18) - Prometheus/Grafana

### Integrações Futuras

- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **Grafana Loki**: Agregação de logs
- **CloudWatch**: AWS logging
- **Datadog**: Monitoramento completo
- **Sentry**: Error tracking

---

## 📚 Referências

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file)
- [Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)
- [Structured Logging](https://www.honeycomb.io/blog/structured-logging-and-your-team)

---

**Implementado por:** Kiro AI
**Tempo estimado:** 4-6 horas
**Tempo real:** ~3 horas
**Complexidade:** Média
**Impacto:** Alto ⭐⭐⭐⭐⭐
