# 🤝 Guia de Contribuição - MestreDB Backend

Obrigado por considerar contribuir com o MestreDB Backend! Este guia ajudará você a começar.

---

## 📋 Índice

1. [Como Contribuir](#como-contribuir)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Padrões de Código](#padrões-de-código)
4. [Processo de Pull Request](#processo-de-pull-request)
5. [Reportar Bugs](#reportar-bugs)
6. [Sugerir Melhorias](#sugerir-melhorias)

---

## 🚀 Como Contribuir

### Tipos de Contribuição

1. **Reportar Bugs** 🐛
2. **Sugerir Melhorias** 💡
3. **Corrigir Bugs** 🔧
4. **Implementar Features** ✨
5. **Melhorar Documentação** 📚
6. **Escrever Testes** 🧪

---

## 🛠️ Configuração do Ambiente

### 1. Fork e Clone

```bash
# Fork no GitHub
# Depois clone seu fork
git clone https://github.com/SEU-USUARIO/MestreDB-backend.git
cd MestreDB-backend

# Adicionar upstream
git remote add upstream https://github.com/Lucas2005y/MestreDB-backend.git
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Ambiente

```bash
# Copiar .env.example
cp .env.example .env

# Editar .env com suas configurações
```

### 4. Subir Banco de Dados

```bash
docker-compose up -d mysql
```

### 5. Aplicar Migrations

```bash
npm run migration:run
```

### 6. Rodar Testes

```bash
npm test
```

---

## 📝 Padrões de Código

### Clean Architecture

O projeto segue **Clean Architecture**. Respeite as camadas:

```
Domain → Application → Infrastructure → Presentation
```

**Regras:**
- ✅ Domain não depende de nada
- ✅ Application depende apenas de Domain
- ✅ Infrastructure implementa interfaces de Application
- ✅ Presentation usa Application

### TypeScript

```typescript
// ✅ Bom - Tipos explícitos
function createUser(data: CreateUserDTO): Promise<User> {
  // ...
}

// ❌ Ruim - Tipos implícitos
function createUser(data: any): any {
  // ...
}
```

### Nomenclatura

```typescript
// Classes: PascalCase
class UserService {}

// Interfaces: PascalCase com I
interface IUserRepository {}

// Funções/Variáveis: camelCase
const userName = 'João';
function getUserById() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_ATTEMPTS = 5;
```

### Commits

Seguir **Conventional Commits**:

```bash
# Features
git commit -m "feat: adicionar autenticação JWT"

# Correções
git commit -m "fix: corrigir validação de email"

# Documentação
git commit -m "docs: atualizar README"

# Testes
git commit -m "test: adicionar testes de UserService"

# Refatoração
git commit -m "refactor: melhorar estrutura de pastas"

# Estilo
git commit -m "style: formatar código com prettier"
```

---

## 🔄 Processo de Pull Request

### 1. Criar Branch

```bash
# Atualizar main
git checkout main
git pull upstream main

# Criar branch
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

### 2. Fazer Mudanças

```bash
# Fazer alterações
# Testar localmente
npm test

# Verificar lint
npm run lint:fix
```

### 3. Commit

```bash
git add .
git commit -m "feat: descrição clara da mudança"
```

### 4. Push

```bash
git push origin feature/nome-da-feature
```

### 5. Abrir Pull Request

1. Ir ao GitHub
2. Clicar em "New Pull Request"
3. Preencher template:

```markdown
## Descrição
Breve descrição da mudança

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue padrões do projeto
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Todos os testes passando
- [ ] Lint sem erros
```

### 6. Code Review

- Responder comentários
- Fazer ajustes solicitados
- Aguardar aprovação

---

## 🐛 Reportar Bugs

### Template de Bug Report

```markdown
**Descrição do Bug**
Descrição clara do problema

**Como Reproduzir**
1. Ir para '...'
2. Clicar em '...'
3. Ver erro

**Comportamento Esperado**
O que deveria acontecer

**Screenshots**
Se aplicável

**Ambiente**
- OS: [Windows/Linux/Mac]
- Node: [versão]
- Navegador: [se aplicável]

**Logs**
```
Colar logs relevantes
```
```

---

## 💡 Sugerir Melhorias

### Template de Feature Request

```markdown
**Problema que Resolve**
Descrição do problema atual

**Solução Proposta**
Como você imagina a solução

**Alternativas Consideradas**
Outras abordagens pensadas

**Contexto Adicional**
Qualquer informação relevante
```

---

## ✅ Checklist de Contribuição

Antes de submeter PR:

- [ ] Código segue Clean Architecture
- [ ] Tipos TypeScript corretos
- [ ] Nomenclatura consistente
- [ ] Commits seguem Conventional Commits
- [ ] Testes adicionados/atualizados
- [ ] Todos os testes passando (`npm test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Documentação atualizada
- [ ] Migrations criadas (se necessário)
- [ ] README atualizado (se necessário)

---

## 📚 Recursos Úteis

### Documentação do Projeto
- [Getting Started](../01-getting-started/QUICK_START.md)
- [Architecture](../02-architecture/OVERVIEW.md)
- [Development Guide](../03-development/DEVELOPMENT_GUIDE.md)
- [Testing Guide](../03-development/TESTING_GUIDE.md)

### Padrões
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## 🎯 Áreas que Precisam de Ajuda

### Alta Prioridade
- [ ] Testes de integração
- [ ] Documentação de API
- [ ] Exemplos de uso

### Média Prioridade
- [ ] Melhorias de performance
- [ ] Refatoração de código legado
- [ ] Tradução de documentação

### Baixa Prioridade
- [ ] Melhorias de UI/UX (se houver)
- [ ] Otimizações diversas

---

## 💬 Comunicação

### Onde Pedir Ajuda
- **Issues:** Para bugs e features
- **Discussions:** Para perguntas gerais
- **Pull Requests:** Para code review

### Código de Conduta
- Seja respeitoso
- Seja construtivo
- Seja paciente
- Seja colaborativo

---

## 🏆 Reconhecimento

Todos os contribuidores serão reconhecidos no README.md!

---

## 📞 Contato

- **GitHub:** [Lucas2005y](https://github.com/Lucas2005y)
- **Issues:** [GitHub Issues](https://github.com/Lucas2005y/MestreDB-backend/issues)

---

**Obrigado por contribuir! 🎉**

---

**Última atualização:** 2024-11-26
