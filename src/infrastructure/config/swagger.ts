import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MestreDB API',
      version: '1.0.0',
      description: 'API REST para gerenciamento de usuários seguindo Clean Architecture',
      contact: {
        name: 'Equipe MestreDB',
        email: 'contato@mestredb.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.mestredb.com/api',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/presentation/routes/*.ts',
    './src/presentation/controllers/*.ts'
  ]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Configuração customizada do Swagger UI
  const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    `,
    customSiteTitle: 'MestreDB API Documentation',
    customfavIcon: '/favicon.ico'
  };

  // Rota para documentação
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

  // Rota para JSON da documentação
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log('📚 Swagger UI configurado em /api-docs');
};

export { specs };