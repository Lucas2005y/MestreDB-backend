# 🏗️ Visão Geral da Arquitetura

## 📋 Clean Architecture

O MestreDB Backend implementa **Clean Architecture** com padrões avançados de design.

### Princípios Fundamentais

1. **Independência de Frameworks** - Arquitetura não depende de bibliotecas
2. **Testabilidade** - Regras de negócio podem ser testadas isoladamente
3. **Independência de UI** - UI pode mudar sem afetar regras de negócio
4. **Independência de Banco** - Banco pode ser trocado facilmente
5. **Independência de Agentes Externos** - Regras não conhecem o mundo externo

### Padrões Implementados

- **Factory Pattern** - Criação controlada de objetos
- **Dependency Injection** - Gerenciamento de dependências
- **Repository Pattern** - Abstração de dados
- **Use Case Pattern** - Lógica de negócio isolada
- **Service Registry** - Registro centralizado

---

## 📁 Camadas

### 1. Domain (Domínio)
**Núcleo do negócio**
- Entidades
- Interfaces
- Regras de negócio

### 2. Application (Aplicação)
**Casos de uso**
- Use Cases
- Services
- DTOs

### 3. Infrastructure (Infraestrutura)
**Implementações técnicas**
- Repositories
- Database
- Configurações

### 4. Presentation (Apresentação)
**Interface HTTP**
- Controllers
- Routes
- Middlewares

### 5. Main (Principal)
**Factory Pattern**
- Factories
- Bootstrap
- Inicialização

---

## 🔄 Fluxo de Dependências

```
Presentation → Application → Domain
Infrastructure → Domain
Main → Todos
```

**Regra:** Dependências sempre apontam para dentro (Domain)

---

## 📚 Documentação Detalhada

- [Domain Layer](./DOMAIN_LAYER.md)
- [Application Layer](./APPLICATION_LAYER.md)
- [Infrastructure Layer](./INFRASTRUCTURE_LAYER.md)
- [Presentation Layer](./PRESENTATION_LAYER.md)
- [Main Layer](./MAIN_LAYER.md)

**Guia Completo:** [CleanArchitectureGuide/01-Estruturacao-Clean-Architecture.md](../../CleanArchitectureGuide/01-Estruturacao-Clean-Architecture.md)
