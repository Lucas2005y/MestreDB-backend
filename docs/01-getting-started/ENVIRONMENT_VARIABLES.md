# 🔐 Variáveis de Ambiente

Este documento descreve todas as variáveis de ambiente necessárias para executar o MestreDB Backend.

---

## 📋 Visão Geral

O projeto usa validação automática de variáveis de ambiente no startup. Se alguma variável obrigatória estiver faltando ou inválida, o servidor **não iniciará** e exibirá mensagens de erro claras.

---

## 🚀 Quick Start

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o `.env` com suas configurações

3. Inicie o servidor:
```bash
npm run dev
```

4. Se houver erros de validação, corrija-os conforme as mensagens exibidas

---

## 📚 Variáveis Disponíveis

### 🌍 Ambiente

#### `NODE_ENV`
- **Tipo:** String
- **Valores:** `development`, `production`, `test`
- **Padrão:** `development`
- **Obrigatório:** Não
- **Descrição:** Define o ambiente de execução da aplicação

**Exemplo:**
```env
NODE_ENV=development
```

---

#### `PORT`
- **Tipo:** Number
- **Valores:** 1-65535
- **Padrão:** `3000`
- **Obrigatório:** Não
- **Descrição:** Porta onde o servidor HTTP irá escutar

**Exemplo:**
```env
PORT=3000
```

---

### 🗄️ MySQL

#### `MYSQL_HOST`
- **Tipo:** String
- **Obrigatório:** ✅ Sim
- **Descrição:** Endereço do servidor MySQL

**Exemplo:**
```env
MYSQL_HOST=localhost
```

---

#### `MYSQL_PORT`
- **Tipo:** Number
- **Valores:** 1-65535
- **Padrão:** `3306`
- **Obrigatório:** Não
- **Descrição:** Porta do servidor MySQL

**Exemplo:**
```env
MYSQL_PORT=3307
```

---

#### `MYSQL_USERNAME`
- **Tipo:** String
- **Obrigatório:** ✅ Sim
- **Descrição:** Usuário para conexão com MySQL

**Exemplo:**
```env
MYSQL_USERNAME=root
```

---

#### `MYSQL_PASSWORD`
- **Tipo:** String
- **Obrigatório:** ✅ Sim
- **Descrição:** Senha para conexão com MySQL (pode ser vazia)

**Exemplo:**
```env
MYSQL_PASSWORD=admin123
```

---

#### `MYSQL_DATABASE`
- **Tipo:** String
- **Obrigatório:** ✅ Sim
- **Descrição:** Nome do banco de dados a ser utilizado

**Exemplo:**
```env
MYSQL_DATABASE=mestredb_sql
```

---

### 🔐 JWT (Autenticação)

#### `JWT_SECRET`
- **Tipo:** String
- **Mínimo:** 32 caracteres
- **Obrigatório:** ✅ Sim
- **Descrição:** Chave secreta para assinatura dos tokens JWT

**⚠️ IMPORTANTE:**
- Use um valor forte e único
- **NUNCA** use o valor padrão em produção
- Gere com: `openssl rand -base64 32`

**Exemplo:**
```env
JWT_SECRET=sua_chave_secreta_super_forte_com_minimo_32_caracteres
```

---

#### `JWT_EXPIRES_IN`
- **Tipo:** String
- **Formato:** `<número><unidade>` (s=segundos, m=minutos, h=horas, d=dias)
- **Padrão:** `1h`
- **Obrigatório:** Não
- **Descrição:** Tempo de expiração do access token

**Exemplo:**
```env
JWT_EXPIRES_IN=1h
```

**Valores comuns:**
- `15m` - 15 minutos
- `1h` - 1 hora (recomendado)
- `24h` - 24 horas

---

#### `REFRESH_TOKEN_EXPIRES_IN`
- **Tipo:** String
- **Formato:** `<número><unidade>` (s=segundos, m=minutos, h=horas, d=dias)
- **Padrão:** `7d`
- **Obrigatório:** Não
- **Descrição:** Tempo de expiração do refresh token

**⚠️ IMPORTANTE:** Deve ser maior que `JWT_EXPIRES_IN`

**Exemplo:**
```env
REFRESH_TOKEN_EXPIRES_IN=7d
```

**Valores comuns:**
- `7d` - 7 dias (recomendado)
- `30d` - 30 dias
- `90d` - 90 dias

---

### 🌐 CORS

#### `CORS_ORIGIN`
- **Tipo:** String
- **Obrigatório:** ✅ Sim
- **Descrição:** Origem permitida para requisições CORS

**Exemplo:**
```env
# Desenvolvimento
CORS_ORIGIN=http://localhost:3000

# Produção
CORS_ORIGIN=https://mestredb.com
```

**Múltiplas origens:**
```env
CORS_ORIGIN=http://localhost:3000,https://app.mestredb.com
```

---

### ⚡ Rate Limiting

#### `RATE_LIMIT_MAX_ATTEMPTS`
- **Tipo:** Number
- **Mínimo:** 1
- **Padrão:** `5`
- **Obrigatório:** Não
- **Descrição:** Número máximo de tentativas de login antes de bloquear

**Exemplo:**
```env
RATE_LIMIT_MAX_ATTEMPTS=5
```

---

#### `RATE_LIMIT_WINDOW_MINUTES`
- **Tipo:** Number
- **Mínimo:** 1
- **Padrão:** `15`
- **Obrigatório:** Não
- **Descrição:** Janela de tempo (em minutos) para contagem de tentativas

**Exemplo:**
```env
RATE_LIMIT_WINDOW_MINUTES=15
```

---

#### `RATE_LIMIT_BLOCK_MINUTES`
- **Tipo:** Number
- **Mínimo:** 1
- **Padrão:** `15`
- **Obrigatório:** Não
- **Descrição:** Tempo de bloqueio (em minutos) após exceder o limite

**Exemplo:**
```env
RATE_LIMIT_BLOCK_MINUTES=15
```

---

### 👤 Administrador Padrão

#### `ADMIN_EMAIL`
- **Tipo:** String (email válido)
- **Padrão:** `admin@mestredb.com`
- **Obrigatório:** Não
- **Descrição:** Email do usuário administrador criado automaticamente

**Exemplo:**
```env
ADMIN_EMAIL=admin@mestredb.com
```

---

#### `ADMIN_PASSWORD`
- **Tipo:** String
- **Mínimo:** 8 caracteres
- **Padrão:** `MinhaSenh@123`
- **Obrigatório:** Não
- **Descrição:** Senha do usuário administrador criado automaticamente

**⚠️ IMPORTANTE:** Altere a senha padrão após o primeiro login em produção!

**Exemplo:**
```env
ADMIN_PASSWORD=MinhaSenh@123
```

---

## 🔍 Validação Automática

O sistema valida automaticamente todas as variáveis no startup:

### ✅ Validações Realizadas

1. **Presença:** Variáveis obrigatórias devem estar definidas
2. **Tipo:** Números devem ser numéricos, emails devem ser válidos
3. **Formato:** Tokens de tempo devem seguir o padrão correto
4. **Tamanho:** JWT_SECRET deve ter no mínimo 32 caracteres
5. **Lógica:** JWT_EXPIRES_IN deve ser menor que REFRESH_TOKEN_EXPIRES_IN
6. **Segurança:** Valores padrões não podem ser usados em produção

### ❌ Exemplo de Erro

Se uma variável estiver inválida, você verá:

```
❌ Erro na validação de variáveis de ambiente:

  ❌ "JWT_SECRET" é obrigatória
  ❌ "MYSQL_HOST" é obrigatória
  ❌ "JWT_EXPIRES_IN" está em formato inválido

💡 Verifique seu arquivo .env e corrija os erros acima.
```

---

## 🛠️ Comandos Úteis

### Ver documentação das variáveis
```bash
npm run env:docs
```

### Validar configuração atual
```bash
npm run dev
```
Se houver erros, eles serão exibidos imediatamente.

---

## 📝 Exemplos de Configuração

### Desenvolvimento Local

```env
NODE_ENV=development
PORT=3000

MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=mestredb_sql

JWT_SECRET=dev_secret_key_with_at_least_32_characters_long
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_BLOCK_MINUTES=15

ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=MinhaSenh@123
```

---

### Produção

```env
NODE_ENV=production
PORT=3000

MYSQL_HOST=mysql.production.com
MYSQL_PORT=3306
MYSQL_USERNAME=mestredb_prod_user
MYSQL_PASSWORD=SENHA_FORTE_AQUI_MINIMO_32_CARACTERES
MYSQL_DATABASE=mestredb_production

JWT_SECRET=GERE_UM_SECRET_FORTE_COM_OPENSSL_RAND_BASE64_32
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

CORS_ORIGIN=https://mestredb.com

RATE_LIMIT_MAX_ATTEMPTS=3
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_BLOCK_MINUTES=30

ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=SENHA_ADMIN_FORTE_UNICA_MINIMO_16_CARACTERES
```

---

### Testes

```env
NODE_ENV=test
PORT=3001

MYSQL_HOST=localhost
MYSQL_PORT=3307
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=mestredb_test

JWT_SECRET=test_secret_key_with_at_least_32_characters_long
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3001

RATE_LIMIT_MAX_ATTEMPTS=100
RATE_LIMIT_WINDOW_MINUTES=1
RATE_LIMIT_BLOCK_MINUTES=1

ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=TestPassword123
```

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca commite arquivos `.env`** no Git
2. Use `.env.example` como template (sem valores sensíveis)
3. Gere JWT_SECRET forte: `openssl rand -base64 32`
4. Use senhas diferentes para cada ambiente
5. Rotacione secrets periodicamente em produção
6. Use gerenciadores de secrets (AWS Secrets Manager, Vault)

### ⚠️ Avisos de Segurança

O sistema emite avisos se detectar:
- JWT_SECRET com valor padrão em produção
- ADMIN_PASSWORD fraca em produção
- CORS_ORIGIN com localhost em produção

---

## 🐛 Troubleshooting

### Erro: "JWT_SECRET é obrigatória"
**Solução:** Adicione `JWT_SECRET` no arquivo `.env`

### Erro: "JWT_SECRET deve ter no mínimo 32 caracteres"
**Solução:** Use um secret mais longo. Gere com: `openssl rand -base64 32`

### Erro: "JWT_EXPIRES_IN está em formato inválido"
**Solução:** Use formato correto: `1h`, `30m`, `7d`, etc.

### Erro: "JWT_EXPIRES_IN deve ser menor que REFRESH_TOKEN_EXPIRES_IN"
**Solução:** Ajuste os valores. Ex: `JWT_EXPIRES_IN=1h` e `REFRESH_TOKEN_EXPIRES_IN=7d`

### Servidor não inicia
**Solução:** Verifique os logs de erro. Todas as variáveis obrigatórias devem estar definidas.

---

## 📚 Referências

- [Joi Validation](https://joi.dev/api/)
- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última atualização:** 2025-01-18
**Versão:** 1.0.0
