# 📚 Documentação - MestreDB Backend

Bem-vindo à documentação completa do MestreDB Backend!

---

## 🗂️ Estrutura da Documentação

### 01. 🚀 [Getting Started](./01-getting-started/)
**Comece aqui!** Tudo que você precisa para começar a usar o projeto.

- [Quick Start](./01-getting-started/QUICK_START.md) - Início rápido
- [Installation](./01-getting-started/INSTALLATION.md) - Instalação detalhada
- [Project Structure](./01-getting-started/PROJECT_STRUCTURE.md) - Estrutura do projeto
- [Environment Variables](./01-getting-started/ENVIRONMENT_VARIABLES.md) - Variáveis de ambiente
- [Viewing Logs (Windows)](./01-getting-started/VIEWING_LOGS_WINDOWS.md) - Como ver logs

### 02. 🏗️ [Architecture](./02-architecture/)
**Entenda a arquitetura.** Clean Architecture em detalhes.

- [Overview](./02-architecture/OVERVIEW.md) - Visão geral
- [Domain Layer](./02-architecture/DOMAIN_LAYER.md) - Camada de domínio
- [Application Layer](./02-architecture/APPLICATION_LAYER.md) - Camada de aplicação
- [Infrastructure Layer](./02-architecture/INFRASTRUCTURE_LAYER.md) - Camada de infraestrutura
- [Presentation Layer](./02-architecture/PRESENTATION_LAYER.md) - Camada de apresentação
- [Main Layer](./02-architecture/MAIN_LAYER.md) - Camada principal

### 03. 💻 [Development](./03-development/)
**Desenvolva com confiança.** Guias de desenvolvimento e testes.

- [Development Guide](./03-development/DEVELOPMENT_GUIDE.md) - Guia de desenvolvimento
- [Testing Guide](./03-development/TESTING_GUIDE.md) - Guia de testes

### 04. ✨ [Features](./04-features/)
**Funcionalidades do sistema.** Documentação das features implementadas.

- [Authentication](./04-features/AUTHENTICATION.md) - Sistema de autenticação
- [User Management](./04-features/USER_MANAGEMENT.md) - Gerenciamento de usuários
- [Security](./04-features/SECURITY.md) - Recursos de segurança

### 05. 🗄️ [Database](./05-database/)
**Banco de dados.** Schema, migrations e seeds.

- [README](./05-database/README.md) - Visão geral do banco
- [Schema](./05-database/SCHEMA.md) - Estrutura do banco
- [Seeds](./05-database/SEEDS.md) - Dados iniciais
- **[Migrations](./05-database/migrations/)** - Sistema de migrations
  - [Migrations Guide](./05-database/migrations/MIGRATIONS_GUIDE.md) - Guia completo
  - [Quick Reference](./05-database/migrations/QUICK_REFERENCE.md) - Referência rápida
  - [Examples](./05-database/migrations/MIGRATION_EXAMPLES.md) - Exemplos práticos

### 06. 📡 [API Reference](./06-api-reference/)
**Documentação da API.** Todos os endpoints disponíveis.

- [API Overview](./06-api-reference/API_OVERVIEW.md) - Visão geral da API
- [Auth Endpoints](./06-api-reference/AUTH_ENDPOINTS.md) - Endpoints de autenticação
- [User Endpoints](./06-api-reference/USER_ENDPOINTS.md) - Endpoints de usuários

### 07. 🚀 [Deployment](./07-deployment/)
**Deploy em produção.** Configuração e boas práticas.

- [Environment Setup](./07-deployment/ENVIRONMENT_SETUP.md) - Configuração de ambiente
- [External Configs](./07-deployment/EXTERNAL_CONFIGS.md) - Configurações externas
- [Production Readiness](./07-deployment/PRODUCTION_READINESS.md) - Checklist de produção

### 08. 🔧 [Troubleshooting](./08-troubleshooting/)
**Resolva problemas.** FAQ e soluções comuns.

- [FAQ](./08-troubleshooting/FAQ.md) - Perguntas frequentes

### 09. 🗺️ [Roadmap](./09-roadmap/)
**Melhorias e futuro.** Roadmap de melhorias e implementações.

- [Improvements](./09-roadmap/IMPROVEMENTS.md) - Roadmap de melhorias
- **Implementações:**
  - [Environment Validation](./09-roadmap/IMPLEMENTATION_ENV_VALIDATION.md)
  - [Health Check](./09-roadmap/IMPLEMENTATION_HEALTH_CHECK.md)
  - [Migrations](./09-roadmap/IMPLEMENTATION_MIGRATIONS.md)
  - [Pagination](./09-roadmap/IMPLEMENTATION_PAGINATION.md)
  - [Structured Logs](./09-roadmap/IMPLEMENTATION_STRUCTURED_LOGS.md)
  - [Tests](./09-roadmap/IMPLEMENTATION_TESTS.md)
  - [Test Expansion Summary](./09-roadmap/TEST_EXPANSION_SUMMARY.md)

### 10. 🤝 [Contributing](./10-contributing/)
**Contribua com o projeto.** Guia de contribuição.

- [Contributing Guide](./10-contributing/CONTRIBUTING.md) - Como contribuir

---

## 🎯 Guias Rápidos

### Para Iniciantes
1. 📖 [Quick Start](./01-getting-started/QUICK_START.md)
2. 🏗️ [Architecture Overview](./02-architecture/OVERVIEW.md)
3. 📡 [API Overview](./06-api-reference/API_OVERVIEW.md)

### Para Desenvolvedores
1. 💻 [Development Guide](./03-development/DEVELOPMENT_GUIDE.md)
2. 🧪 [Testing Guide](./03-development/TESTING_GUIDE.md)
3. 🗄️ [Migrations Quick Reference](./05-database/migrations/QUICK_REFERENCE.md)

### Para DevOps
1. 🚀 [Production Readiness](./07-deployment/PRODUCTION_READINESS.md)
2. ⚙️ [Environment Setup](./07-deployment/ENVIRONMENT_SETUP.md)
3. 🔧 [Troubleshooting](./08-troubleshooting/FAQ.md)

---

## 🔍 Busca Rápida

### Autenticação
- [Como funciona JWT?](./04-features/AUTHENTICATION.md)
- [Endpoints de auth](./06-api-reference/AUTH_ENDPOINTS.md)
- [Rate limiting](./04-features/SECURITY.md)

### Banco de Dados
- [Ver schema](./05-database/SCHEMA.md)
- [Criar migration](./05-database/migrations/QUICK_REFERENCE.md)
- [Aplicar migrations](./05-database/migrations/MIGRATIONS_GUIDE.md)

### Testes
- [Como escrever testes](./03-development/TESTING_GUIDE.md)
- [Cobertura atual](./09-roadmap/IMPLEMENTATION_TESTS.md)
- [Exemplos de testes](./09-roadmap/TEST_EXPANSION_SUMMARY.md)

### Deploy
- [Checklist de produção](./07-deployment/PRODUCTION_READINESS.md)
- [Variáveis de ambiente](./01-getting-started/ENVIRONMENT_VARIABLES.md)
- [Configurações externas](./07-deployment/EXTERNAL_CONFIGS.md)

---

## 📊 Status do Projeto

### Implementado ✅
- ✅ Clean Architecture
- ✅ Autenticação JWT
- ✅ Gerenciamento de usuários
- ✅ Validação de variáveis de ambiente
- ✅ Logs estruturados (Winston)
- ✅ Health checks completos
- ✅ Paginação padronizada
- ✅ Sistema de migrations
- ✅ Testes automatizados (~75-85% coverage)

### Em Desenvolvimento 🔄
- 🔄 Soft delete
- 🔄 Refresh tokens no banco
- 🔄 RBAC (Roles e Permissões)

### Planejado 📅
- 📅 Recuperação de senha
- 📅 Verificação de email
- 📅 Upload de avatar
- 📅 Auditoria completa

Ver [Roadmap completo](./09-roadmap/IMPROVEMENTS.md)

---

## 🛠️ Tecnologias

- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript
- **Framework:** Express.js
- **ORM:** TypeORM
- **Banco:** MySQL
- **Autenticação:** JWT
- **Logs:** Winston
- **Testes:** Jest + Supertest
- **Documentação:** Swagger/OpenAPI

---

## 📞 Suporte

### Encontrou um problema?
1. Verificar [FAQ](./08-troubleshooting/FAQ.md)
2. Buscar em [Issues](https://github.com/Lucas2005y/MestreDB-backend/issues)
3. Abrir nova issue

### Quer contribuir?
1. Ler [Contributing Guide](./10-contributing/CONTRIBUTING.md)
2. Fazer fork do projeto
3. Abrir Pull Request

---

## 📝 Convenções

### Nomenclatura de Arquivos
- **UPPER_CASE.md** - Documentação principal
- **PascalCase.md** - Guias específicos
- **kebab-case.md** - Arquivos auxiliares

### Estrutura de Pastas
- **01-09** - Numeração para ordem lógica
- **Subpastas** - Agrupamento por tema

---

## 🔗 Links Úteis

- **Repositório:** [GitHub](https://github.com/Lucas2005y/MestreDB-backend)
- **Swagger:** http://localhost:3000/api-docs (em desenvolvimento)
- **TypeORM:** https://typeorm.io/
- **Clean Architecture:** https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

---

## 📅 Última Atualização

**Data:** 2024-11-26
**Versão:** 1.0.0
**Status:** ✅ Documentação completa e organizada

---

**Desenvolvido com ❤️ pela equipe MestreDB**
