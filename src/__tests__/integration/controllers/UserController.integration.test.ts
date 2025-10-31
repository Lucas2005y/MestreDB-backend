import request from 'supertest';
import { DataSource, Not, In } from 'typeorm';
import { Application } from 'express';
import { AppFactory } from '../../../main/factories/AppFactory';
import { TestDataSource } from '../setup';
import { UserTest } from '../entities/User.test';
import { configureServices } from '../../../shared/container/ServiceRegistry';
import { container } from '../../../shared/container/DIContainer';
import { TYPES } from '../../../shared/container/ServiceRegistry';
import { RateLimitingService } from '../../../application/services/RateLimitingService';
import bcrypt from 'bcrypt';

describe('UserController Integration Tests', () => {
  let app: Application;
  let dataSource: DataSource;
  let testUser: UserTest;
  let superUser: UserTest;
  let authToken: string;
  let superUserToken: string;

  beforeAll(async () => {
    // Usar o banco de dados de teste configurado
    dataSource = TestDataSource;
    
    // Inicializar o banco de dados de teste
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    
    // Configurar serviços do container DI com TestDataSource
    configureServices(dataSource);
    
    // Criar aplicação
    app = await AppFactory.create();
    
    // Criar usuários de teste
    const userRepository = dataSource.getRepository(UserTest);
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Usuário comum
    testUser = userRepository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      is_superuser: false,
      last_access: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });
    
    // Super usuário
    superUser = userRepository.create({
      name: 'Super User',
      email: 'super@example.com',
      password: hashedPassword,
      is_superuser: true,
      last_access: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await userRepository.save([testUser, superUser]);

    // Fazer login para obter tokens
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    authToken = loginResponse.body.token;

    const superLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'super@example.com',
        password: 'password123'
      });
    superUserToken = superLoginResponse.body.token;
  });

  afterAll(async () => {
    // Limpar RateLimitingService
    try {
      const rateLimitingService = container.resolve<RateLimitingService>(TYPES.RateLimitingService);
      rateLimitingService.destroy();
    } catch (error) {
      // Ignorar se o serviço não foi criado
    }
    
    // Limpar container DI
    container.clear();
    
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Limpar dados entre testes (exceto os usuários de teste)
    const userRepository = dataSource.getRepository(UserTest);
    await userRepository.delete({ id: Not(In([testUser.id, superUser.id])) });
  });

  describe('POST /usuarios', () => {
    it('deve criar um novo usuário com permissões de superuser', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        is_superuser: false
      };

      const response = await request(app)
        .post('/usuarios')
        .set('Authorization', `Bearer ${superUserToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'New User');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 403 quando usuário comum tenta criar usuário', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/usuarios')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUser);

      expect(response.status).toBe(403);
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const newUser = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/usuarios')
        .send(newUser);

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const response = await request(app)
        .post('/usuarios')
        .set('Authorization', `Bearer ${superUserToken}`)
        .send({
          email: 'invalid@example.com'
          // name e password faltando
        });

      expect(response.status).toBe(400);
    });

    it('deve retornar erro 409 quando email já estiver em uso', async () => {
      const response = await request(app)
        .post('/usuarios')
        .set('Authorization', `Bearer ${superUserToken}`)
        .send({
          name: 'Another User',
          email: 'test@example.com', // Email já existe
          password: 'password123'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/usuarios', () => {
    it('deve listar todos os usuários com permissões de superuser', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      
      // Verificar se não há senhas nos usuários retornados
      response.body.users.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('deve retornar erro 403 quando usuário comum tenta listar usuários', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app)
        .get('/api/usuarios');

      expect(response.status).toBe(401);
    });

    it('deve aplicar paginação corretamente', async () => {
      const response = await request(app)
        .get('/api/usuarios?page=1&limit=1')
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.users.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/usuarios/perfil', () => {
    it('deve retornar o perfil do usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app)
        .get('/api/usuarios/perfil');

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 401 com token inválido', async () => {
      const response = await request(app)
        .get('/api/usuarios/perfil')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/usuarios/perfil', () => {
    it('deve atualizar o perfil do usuário autenticado', async () => {
      const updateData = {
        name: 'Updated Test User',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Perfil atualizado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Updated Test User');
      expect(response.body.user).toHaveProperty('email', 'updated@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app)
        .put('/api/usuarios/perfil')
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const response = await request(app)
        .put('/api/usuarios/perfil')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('deve retornar usuário específico com permissões de superuser', async () => {
      const response = await request(app)
        .get(`/usuarios/${testUser.id}`)
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testUser.id);
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 403 quando usuário comum tenta acessar outro usuário', async () => {
      const response = await request(app)
        .get(`/usuarios/${superUser.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('deve retornar erro 404 para usuário inexistente', async () => {
      const response = await request(app)
        .get('/api/usuarios/99999')
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app)
        .get(`/usuarios/${testUser.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /usuarios/:id', () => {
    it('deve atualizar usuário específico com permissões de superuser', async () => {
      const updateData = {
        name: 'Updated User Name',
        is_superuser: true
      };

      const response = await request(app)
        .put(`/usuarios/${testUser.id}`)
        .set('Authorization', `Bearer ${superUserToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuário atualizado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('name', 'Updated User Name');
      expect(response.body.user).toHaveProperty('is_superuser', true);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 403 quando usuário comum tenta atualizar outro usuário', async () => {
      const response = await request(app)
        .put(`/usuarios/${superUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Hacked Name'
        });

      expect(response.status).toBe(403);
    });

    it('deve retornar erro 404 para usuário inexistente', async () => {
      const response = await request(app)
        .put('/api/usuarios/99999')
        .set('Authorization', `Bearer ${superUserToken}`)
        .send({
          name: 'New Name'
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app)
        .put(`/usuarios/${testUser.id}`)
        .send({
          name: 'New Name'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /usuarios/:id', () => {
    let userToDelete: UserTest;

    beforeEach(async () => {
      // Criar usuário para deletar em cada teste
      const userRepository = dataSource.getRepository(UserTest);
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      userToDelete = userRepository.create({
        name: 'User To Delete',
        email: 'delete@example.com',
        password: hashedPassword,
        is_superuser: false,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await userRepository.save(userToDelete);
    });

    it('deve deletar usuário específico com permissões de superuser', async () => {
      const response = await request(app)
        .delete(`/usuarios/${userToDelete.id}`)
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Usuário deletado com sucesso');

      // Verificar se o usuário foi realmente deletado
      const checkResponse = await request(app)
        .get(`/usuarios/${userToDelete.id}`)
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(checkResponse.status).toBe(404);
    });

    it('deve retornar erro 403 quando usuário comum tenta deletar outro usuário', async () => {
      const response = await request(app)
        .delete(`/usuarios/${userToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('deve retornar erro 404 para usuário inexistente', async () => {
      const response = await request(app)
        .delete('/api/usuarios/99999')
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Usuário não encontrado');
    });

    it('deve retornar erro 401 sem token de autenticação', async () => {
      const response = await request(app)
        .delete(`/usuarios/${userToDelete.id}`);

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 400 quando tenta deletar a si mesmo', async () => {
      const response = await request(app)
        .delete(`/usuarios/${superUser.id}`)
        .set('Authorization', `Bearer ${superUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Não é possível deletar seu próprio usuário');
    });
  });
});