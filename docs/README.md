# 📚 Documentação MestreDB Backend

Bem-vindo à documentação completa do MestreDB Backend! Este guia está organizado para facilitar o acesso rápido às informações que você precisa.

## 🎯 Início Rápido

### Para Desenvolvedores Novos
1. 📖 [Guia de Instalação](./01-getting-started/INSTALLATION.md)
2. 🚀 [Primeiros Passos](./01-getting-started/QUICK_START.md)
3. 🏗️ [Visão Geral da Arquitetura](./02-architecture/OVERVIEW.md)

### Para Desenvolvedores Experientes
- 🔧 [Guia de Desenvolvimento](./03-development/DEVELOPMENT_GUIDE.md)
- 🧪 [Guia de Testes](./03-development/TESTING_GUIDE.md)
- 🔐 [Segurança e Autenticação](./04-features/SECURITY.md)

### Para Deploy e Produção
- 🚀 [Guia de Deploy](./05-deployment/DEPLOYMENT.md)
- ⚙️ [Configuração de Ambientes](./05-deployment/ENVIRONMENT_SETUP.md)
- ✅ [Preparação para Produção](./05-deployment/PRODUCTION_READINESS.md)

---

## 📂 Estrutura da Documentação

### 1️⃣ Getting Started (Começando)
Tudo que você precisa para começar a trabalhar no projeto.

- **[Instalação](./01-getting-started/INSTALLATION.md)**
  - Pré-requisitos
  - Instalação de dependências
  - Configuração inicial
  - Docker setup

- **[Início Rápido](./01-getting-started/QUICK_START.md)**
  - Primeiro build
  - Executar em desenvolvimento
  - Testar a API
  - Acessar documentação Swagger

- **[Estrutura do Projeto](./01-getting-started/PROJECT_STRUCTURE.md)**
  - Organização de pastas
  - Convenções de nomenclatura
  - Onde encontrar cada coisa

---

### 2️⃣ Architecture (Arquitetura)
Entenda como o projeto está estruturado.

- **[Visão Geral](./02-architecture/OVERVIEW.md)**
  - Clean Architecture
  - Camadas e responsabilidades
  - Fluxo de dados

- **[Domain Layer](./02-architecture/DOMAIN_LAYER.md)**
  - Entidades
  - Interfaces
  - Regras de negócio

- **[Application Layer](./02-architecture/APPLICATION_LAYER.md)**
  - Casos de uso
  - Serviços
  - DTOs

- **[Infrastructure Layer](./02-architecture/INFRASTRUCTURE_LAYER.md)**
  - Repositórios
  - Banco de dados
  - Integrações externas

- **[Presentation Layer](./02-architecture/PRESENTATION_LAYER.md)**
  - Controllers
  - Rotas
  - Middlewares

- **[Main Layer](./02-architecture/MAIN_LAYER.md)**
  - Factory Pattern
  - Bootstrap
  - Dependency Injection

---

### 3️⃣ Development (Desenvolvimento)
Guias práticos para desenvolvimento diário.

- **[Guia de Desenvolvimento](./03-development/DEVELOPMENT_GUIDE.md)**
  - Workflow de desenvolvimento
  - Comandos úteis
  - Debugging

- **[Guia de Testes](./03-development/TESTING_GUIDE.md)**
  - Testes unitários
  - Testes de integração
  - Testes E2E
  - Coverage

- **[Criando Novas Features](./03-development/CREATING_FEATURES.md)**
  - Passo a passo
  - Checklist
  - Exemplos práticos

- **[Padrões de Código](./03-development/CODE_PATTERNS.md)**
  - Convenções
  - Best practices
  - Code review checklist

---

### 4️⃣ Features (Funcionalidades)
Documentação detalhada de cada funcionalidade.

- **[Autenticação e Autorização](./04-features/AUTHENTICATION.md)**
  - JWT
  - Login/Logout
  - Refresh tokens
  - Permissões

- **[Gestão de Usuários](./04-features/USER_MANAGEMENT.md)**
  - CRUD de usuários
  - Perfis
  - Permissões

- **[Segurança](./04-features/SECURITY.md)**
  - Rate limiting
  - CORS
  - Validação
  - Criptografia

- **[API Endpoints](./04-features/API_ENDPOINTS.md)**
  - Lista completa de endpoints
  - Request/Response examples
  - Status codes

---

### 5️⃣ Deployment (Deploy)
Tudo sobre ambientes e produção.

- **[Configuração de Ambientes](./05-deployment/ENVIRONMENT_SETUP.md)**
  - Development
  - Test
  - Production
  - Variáveis de ambiente

- **[Guia de Deploy](./05-deployment/DEPLOYMENT.md)**
  - Preparação
  - Deploy passo a passo
  - Nginx
  - PM2
  - SSL/TLS

- **[Preparação para Produção](./05-deployment/PRODUCTION_READINESS.md)**
  - Checklist completo
  - Correções urgentes
  - Melhorias importantes
  - Cronograma

- **[Monitoramento](./05-deployment/MONITORING.md)**
  - Logs
  - Métricas
  - Alertas
  - Health checks

---

### 6️⃣ API Reference (Referência da API)
Documentação técnica completa da API.

- **[Visão Geral da API](./06-api-reference/API_OVERVIEW.md)**
  - Base URL
  - Autenticação
  - Formato de respostas
  - Códigos de erro

- **[Endpoints de Autenticação](./06-api-reference/AUTH_ENDPOINTS.md)**
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/refresh
  - POST /api/auth/logout

- **[Endpoints de Usuários](./06-api-reference/USER_ENDPOINTS.md)**
  - GET /api/usuarios
  - POST /api/usuarios
  - GET /api/usuarios/:id
  - PUT /api/usuarios/:id
  - DELETE /api/usuarios/:id

- **[Postman Collection](./06-api-reference/POSTMAN.md)**
  - Como importar
  - Como usar
  - Exemplos

---

### 7️⃣ Database (Banco de Dados)
Documentação do banco de dados.

- **[Schema](./07-database/SCHEMA.md)**
  - Tabelas
  - Relacionamentos
  - Índices

- **[Migrations](./07-database/MIGRATIONS.md)**
  - Como criar
  - Como executar
  - Como reverter

- **[Seeds](./07-database/SEEDS.md)**
  - Dados iniciais
  - Usuário admin

---

### 8️⃣ Troubleshooting (Solução de Problemas)
Problemas comuns e soluções.

- **[FAQ](./08-troubleshooting/FAQ.md)**
  - Perguntas frequentes
  - Soluções rápidas

- **[Erros Comuns](./08-troubleshooting/COMMON_ERRORS.md)**
  - Erro de conexão
  - Erro de build
  - Erro de testes

---

### 9️⃣ Contributing (Contribuindo)
Como contribuir para o projeto.

- **[Guia de Contribuição](./09-contributing/CONTRIBUTING.md)**
  - Como contribuir
  - Pull requests
  - Code review

- **[Changelog](./09-contributing/CHANGELOG.md)**
  - Histórico de versões
  - Mudanças importantes

---

## 🔗 Links Rápidos

### Documentação Externa
- [Swagger UI](http://localhost:3000/api-docs) - Documentação interativa da API
- [TypeORM](https://typeorm.io/) - ORM utilizado
- [Express.js](https://expressjs.com/) - Framework web
- [Jest](https://jestjs.io/) - Framework de testes

### Ferramentas
- [Postman Collection](../MestreDB-API.postman_collection.json) - Coleção de requisições
- [Docker Compose](../docker-compose.yml) - Configuração Docker
- [phpMyAdmin](http://localhost:8080) - Interface do MySQL

---

## 📝 Convenções de Documentação

### Ícones Utilizados
- 📖 Documentação geral
- 🚀 Início rápido / Deploy
- 🏗️ Arquitetura
- 🔧 Desenvolvimento
- 🧪 Testes
- 🔐 Segurança
- ⚙️ Configuração
- 📊 Banco de dados
- 🐛 Troubleshooting
- ✅ Checklist / Validação
- ⚠️ Atenção / Importante
- 💡 Dica / Sugestão

### Formato de Código
```typescript
// Exemplos de código sempre com syntax highlighting
```

### Formato de Comandos
```bash
# Comandos sempre precedidos de comentário explicativo
npm run dev
```

---

## 🆘 Precisa de Ajuda?

1. **Consulte a documentação** - Provavelmente sua dúvida já está respondida aqui
2. **Verifique o FAQ** - [FAQ](./08-troubleshooting/FAQ.md)
3. **Abra uma issue** - [GitHub Issues](https://github.com/Lucas2005y/MestreDB-backend/issues)
4. **Entre em contato** - contato@mestredb.com

---

## 📅 Última Atualização

**Data:** 2025-01-10
**Versão:** 1.0.0
**Responsável:** Equipe MestreDB

---

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.
