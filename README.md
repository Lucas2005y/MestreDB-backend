# MestreDB Backend

Backend da aplicação MestreDB desenvolvido com Clean Architecture, TypeScript, Node.js, Express e MongoDB.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Middleware para Cross-Origin Resource Sharing
- **dotenv** - Gerenciamento de variáveis de ambiente

## 📁 Estrutura do Projeto (Clean Architecture)

```
src/
├── core/                    # Regras de negócio (Business Logic)
│   ├── entities/           # Entidades do domínio
│   ├── usecases/          # Casos de uso da aplicação
│   └── interfaces/        # Contratos e interfaces
├── infrastructure/         # Camada de infraestrutura
│   ├── database/          # Configurações e conexões de banco
│   └── web/               # Configurações de servidor web
├── presentation/          # Camada de apresentação
│   ├── controllers/       # Controladores da API
│   └── routes/           # Definição das rotas
├── shared/               # Utilitários e código compartilhado
└── index.ts             # Ponto de entrada da aplicação
```

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (local ou remoto)
- [Git](https://git-scm.com/)

## 📦 Instalação

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
   
   Copie o arquivo `.env` e configure as variáveis conforme necessário:
   ```bash
   # Exemplo de configuração do .env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mestredb
   DB_NAME=mestredb
   JWT_SECRET=your_jwt_secret_here
   CORS_ORIGIN=http://localhost:3000
   ```

## 🚀 Como Usar

### Desenvolvimento

Para executar a aplicação em modo de desenvolvimento com auto-reload:

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:3000`

### Produção

1. **Compile o TypeScript:**
   ```bash
   npm run build
   ```

2. **Execute a aplicação:**
   ```bash
   npm start
   ```

### Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com nodemon
- `npm run build` - Compila o TypeScript para JavaScript
- `npm start` - Executa a versão compilada em produção
- `npm test` - Executa os testes (a ser implementado)

## 🔧 Configuração do MongoDB

### MongoDB Local

1. **Instale o MongoDB Community Edition**
2. **Inicie o serviço do MongoDB:**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Configure a URI no arquivo .env:**
   ```
   MONGODB_URI=mongodb://localhost:27017/mestredb
   ```

### MongoDB Atlas (Nuvem)

1. **Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Crie um cluster gratuito**
3. **Obtenha a string de conexão**
4. **Configure no arquivo .env:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mestredb
   ```

## 📡 Endpoints da API

### Health Check

- **GET** `/health` - Verifica se a aplicação está funcionando

**Resposta de exemplo:**
```json
{
  "status": "OK",
  "message": "MestreDB Backend is running",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🧪 Testando a Aplicação

1. **Inicie a aplicação:**
   ```bash
   npm run dev
   ```

2. **Teste o endpoint de health check:**
   ```bash
   curl http://localhost:3000/health
   ```

   Ou acesse diretamente no navegador: `http://localhost:3000/health`

## 🔒 Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `MONGODB_URI` | URI de conexão do MongoDB | `mongodb://localhost:27017/mestredb` |
| `DB_NAME` | Nome do banco de dados | `mestredb` |
| `JWT_SECRET` | Chave secreta para JWT | - |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:3000` |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Lucas** - *Desenvolvimento inicial* - [Lucas2005y](https://github.com/Lucas2005y)

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma [issue](https://github.com/Lucas2005y/MestreDB-backend/issues) no GitHub.

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela no repositório!**