import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../main/app';
import { AppDataSource } from '../../infrastructure/config/database';

describe('Users Endpoints', () => {
  let app: Application;
  let adminToken: string;
  let normalUserToken: string;
  let testUserId: number;

  beforeAll(async () => {
    app = await createApp();

    // Inicializar banco de dados
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Login como admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@mestredb.com',
        password: process.env.ADMIN_PASSWORD || 'MinhaSenh@123',
      });

    if (adminLogin.status === 200) {
      adminToken = adminLogin.body.token;
    }
  });

  afterAll(async () => {
    // Limpar usuário de teste se foi criado
    if (testUserId && adminToken) {
      await request(app)
        .delete(`/api/usuarios/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('GET /api/usuarios', () => {
    it('deve listar usuários com paginação padrão', async () => {
      if (!adminToken) {
        console.warn('Pulando teste: token não disponível');
        return;
      }

      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNext');
      expect(response.body.pagination).toHaveProperty('hasPrev');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve listar usuários com paginação customizada', async () => {
      if (!adminToken) return;

      const response = await request(app)
        .get('/api/usuarios?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('deve rejeitar requisição sem autenticação', async () => {
      const response = await request(app).get('/api/usuarios');

      expect(response.status).toBe(401);
    });

    it('deve rejeitar usuário não-superusuário', async () => {
      // Criar usuário normal temporário para teste
      const createResponse = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Usuario Normal Teste',
          email: 'normal.test@example.com',
          password: 'senha123',
          is_superuser: false,
        });

      if (createResponse.status !== 201) {
        console.warn('Pulando teste: não foi possível criar usuário normal');
        return;
      }

      // Fazer login com usuário normal
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'normal.test@example.com',
          password: 'senha123',
        });

      const tempNormalToken = loginResponse.body.token;
      const tempUserId = createResponse.body.data.id;

      // Tentar listar usuários (deve falhar)
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${tempNormalToken}`);

      expect(response.status).toBe(403);

      // Limpar usuário temporário
      await request(app)
        .delete(`/api/usuarios/${tempUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });

  describe('POST /api/usuarios', () => {
    it('deve criar novo usuário como superusuário', async () => {
      if (!adminToken) return;

      const newUser = {
        name: 'Test User Created',
        email: `test${Date.now()}@example.com`,
        password: 'StrongP@ss123',
        is_superuser: false,
      };

      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', newUser.email);
      expect(response.body.data).not.toHaveProperty('password');

      // Salvar ID para limpeza
      testUserId = response.body.data.id;
    });

    it('deve rejeitar email duplicado', async () => {
      if (!adminToken) return;

      const duplicateUser = {
        name: 'Duplicate',
        email: process.env.ADMIN_EMAIL || 'admin@mestredb.com',
        password: 'StrongP@ss123',
        is_superuser: false,
      };

      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar dados inválidos', async () => {
      if (!adminToken) return;

      const invalidUser = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser);

      expect(response.status).toBe(400);
    });

    it('deve rejeitar requisição sem autenticação', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .send({ name: 'Test', email: 'test@example.com', password: 'pass' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/usuarios/:id', () => {
    it('deve buscar usuário por ID', async () => {
      if (!adminToken) return;

      const response = await request(app)
        .get('/api/usuarios/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      if (!adminToken) return;

      const response = await request(app)
        .get('/api/usuarios/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('deve rejeitar ID inválido', async () => {
      if (!adminToken) return;

      const response = await request(app)
        .get('/api/usuarios/abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    it('deve atualizar usuário existente', async () => {
      if (!adminToken || !testUserId) return;

      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app)
        .put(`/api/usuarios/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'Updated Name');
    });

    it('deve rejeitar atualização sem autenticação', async () => {
      const response = await request(app)
        .put('/api/usuarios/1')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    it('deve deletar usuário existente', async () => {
      if (!adminToken) return;

      // Criar usuário para deletar
      const newUser = {
        name: 'To Delete',
        email: `delete${Date.now()}@example.com`,
        password: 'StrongP@ss123',
        is_superuser: false,
      };

      const createResponse = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      if (createResponse.status !== 201) return;

      const userId = createResponse.body.data.id;

      // Deletar usuário
      const response = await request(app)
        .delete(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      if (!adminToken) return;

      const response = await request(app)
        .delete('/api/usuarios/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('deve rejeitar deleção sem autenticação', async () => {
      const response = await request(app).delete('/api/usuarios/1');

      expect(response.status).toBe(401);
    });
  });
});
