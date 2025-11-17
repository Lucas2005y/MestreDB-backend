# ❓ FAQ - Perguntas Frequentes

## 🚀 Instalação e Setup

### Como instalar o projeto?
Siga o [Guia de Instalação](../01-getting-started/INSTALLATION.md)

### Qual versão do Node.js preciso?
Node.js 18+ é requerido

### Docker é obrigatório?
Sim, para o MySQL. Ou configure MySQL manualmente.

---

## 🔐 Autenticação

### Como fazer login?
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mestredb.com","password":"MinhaSenh@123"}'
```

### Token expirou, o que fazer?
Use o refresh token para renovar:
```bash
POST /api/auth/refresh
{"refreshToken": "seu_refresh_token"}
```

### Como usar o token?
```
Authorization: Bearer <seu_token>
```

---

## 🐛 Erros Comuns

### "Port 3307 already in use"
```bash
npm run docker:down
docker ps
# Matar processo se necessário
```

### "Cannot connect to MySQL"
```bash
# Verificar se Docker está rodando
docker ps

# Reiniciar
npm run docker:down
npm run docker:up
```

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Token inválido"
- Verifique se o token está correto
- Verifique se não expirou
- Faça login novamente

---

## 📊 Banco de Dados

### Como acessar o banco?
- phpMyAdmin: http://localhost:8080
- Usuário: root
- Senha: root

### Como resetar o banco?
```bash
npm run docker:down
docker volume prune
npm run docker:up
```

### Como criar uma migration?
```bash
npm run migration:generate -- NomeDaMigration
npm run migration:run
```

---

## 🧪 Testes

### Como rodar testes?
```bash
npm test
```

### Testes falhando?
```bash
# Limpar e reinstalar
rm -rf node_modules
npm install

# Verificar ambiente
NODE_ENV=test npm test
```

---

## 🔧 Desenvolvimento

### Como debugar?
Use VS Code debugger ou console.log

### Hot reload não funciona?
Verifique se nodemon está instalado:
```bash
npm install --save-dev nodemon
```

### Como formatar código?
```bash
npm run format
npm run lint:fix
```

---

## 📚 Mais Ajuda

- [Erros Comuns](./COMMON_ERRORS.md)
- [Guia de Instalação](../01-getting-started/INSTALLATION.md)
- [GitHub Issues](https://github.com/Lucas2005y/MestreDB-backend/issues)
