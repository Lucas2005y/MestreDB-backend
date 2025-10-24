# MestreDB Backend API

API REST para gerenciamento de usuários desenvolvida seguindo os princípios da Clean Architecture, utilizando Node.js, TypeScript, TypeORM e MySQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express.js** - Framework web minimalista
- **TypeORM** - ORM para TypeScript e JavaScript
- **MySQL** - Sistema de gerenciamento de banco de dados
- **Docker** - Containerização
- **Swagger** - Documentação da API
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de dados
- **JWT** - Autenticação (preparado para implementação)

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture**, organizando o código em camadas bem definidas:

```
src/
├── domain/              # Camada de Domínio
│   ├── entities/        # Entidades de negócio
│   └── interfaces/      # Contratos e interfaces
├── application/         # Camada de Aplicação
│   ├── dtos/           # Data Transfer Objects
│   └── usecases/       # Casos de uso
├── infrastructure/     # Camada de Infraestrutura
│   ├── config/         # Configurações
│   ├── database/       # Entidades do banco
│   └── repositories/   # Implementação dos repositórios
├── presentation/       # Camada de Apresentação
│   ├── controllers/    # Controladores
│   ├── middlewares/    # Middlewares
│   └── routes/         # Rotas da API
└── shared/            # Código compartilhado
    ├── errors/        # Tratamento de erros
    └── utils/         # Utilitários
```

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Docker e Docker Compose
- Git

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Lucas2005y/MestreDB-backend.git
cd MestreDB-backend
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Servidor
PORT=3000
NODE_ENV=development

# MongoDB (mantido para compatibilidade)
MONGODB_URI=mongodb://localhost:27017/mestredb
DATABASE_NAME=mestredb

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=admin123
MYSQL_DATABASE=mestredb_sql

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin padrão
ADMIN_EMAIL=admin@mestredb.com
ADMIN_PASSWORD=admin123
```

4. **Inicie o banco de dados MySQL com Docker:**
```bash
npm run docker:up
```

5. **Execute o projeto em modo de desenvolvimento:**
```bash
npm run dev
```

## 🐳 Docker

### Comandos disponíveis:

```bash
# Iniciar containers
npm run docker:up

# Parar containers
npm run docker:down

# Ver logs dos containers
npm run docker:logs

# Inicializar banco de dados
npm run db:init
```

### Serviços disponíveis:

- **MySQL**: `localhost:3306`
- **phpMyAdmin**: `http://localhost:8080`

## 📚 Documentação da API

A documentação da API está disponível via Swagger UI:

- **Desenvolvimento**: `http://localhost:3000/api-docs`
- **JSON da documentação**: `http://localhost:3000/api-docs.json`

### Endpoints principais:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check da API |
| POST | `/api/usuarios` | Criar novo usuário |
| GET | `/api/usuarios` | Listar usuários (paginado) |
| GET | `/api/usuarios/:id` | Buscar usuário por ID |
| PUT | `/api/usuarios/:id` | Atualizar usuário |
| DELETE | `/api/usuarios/:id` | Excluir usuário |

## 🗄️ Banco de Dados

### Estrutura da tabela `users`:

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login DATETIME NULL,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    last_access DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Usuário administrador padrão:

- **Email**: `admin@mestredb.com`
- **Senha**: `admin123`
- **Tipo**: Superusuário

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

## 🔨 Scripts de Desenvolvimento

```bash
# Desenvolvimento
npm run dev              # Iniciar em modo desenvolvimento
npm run build            # Compilar TypeScript
npm run build:watch      # Compilar em modo watch
npm run start            # Iniciar versão compilada

# Banco de dados
npm run typeorm          # CLI do TypeORM
npm run migration:generate  # Gerar migration
npm run migration:run    # Executar migrations
npm run migration:revert # Reverter migration
npm run schema:sync      # Sincronizar schema

# Qualidade de código
npm run lint             # Verificar lint
npm run lint:fix         # Corrigir lint automaticamente
npm run format           # Formatar código

# Docker
npm run docker:up        # Subir containers
npm run docker:down      # Parar containers
npm run docker:logs      # Ver logs
```

## 📝 Exemplos de Uso

### Criar usuário:

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "senha123",
    "is_superuser": false
  }'
```

### Listar usuários:

```bash
curl -X GET "http://localhost:3000/api/usuarios?page=1&limit=10"
```

### Buscar usuário por ID:

```bash
curl -X GET http://localhost:3000/api/usuarios/1
```

## 🔒 Segurança

- Senhas são criptografadas usando bcrypt com salt rounds 12
- Validação de entrada usando class-validator
- Middleware de tratamento de erros
- CORS configurável
- Preparado para autenticação JWT

## 🚀 Deploy

### Variáveis de ambiente para produção:

```env
NODE_ENV=production
PORT=3000
MYSQL_HOST=seu_host_mysql
MYSQL_PORT=3306
MYSQL_USERNAME=seu_usuario
MYSQL_PASSWORD=sua_senha_segura
MYSQL_DATABASE=mestredb_sql
JWT_SECRET=seu_jwt_secret_super_seguro_para_producao
CORS_ORIGIN=https://seu-frontend.com
```

### Build para produção:

```bash
npm run build
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Equipe MestreDB** - *Desenvolvimento inicial*

## 📞 Suporte

Para suporte, envie um email para contato@mestredb.com ou abra uma issue no GitHub.

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!