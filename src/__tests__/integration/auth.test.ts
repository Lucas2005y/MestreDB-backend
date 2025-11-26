import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../main/app';
import { AppDataSource } from '../../infrastructure/config/database';

describe('Auth Endpoints', () => {
  let app: Application;
  let adminToken: string;

  beforeAll(async () => {
    app = await createApp();

    // Inicializar banco de dados se necessário
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Fazer login como admin para obter token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL || 'admin@mestredb.com',
        password: process.env.ADMIN_PASSWORD || 'MinhaSenh@123',
      });

    if (loginResponse.status === 200) {
      adminToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL || 'admin@mestredb.com',
          password: process.env.ADMIN_PASSWORD || 'MinhaSenh@123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve rejeitar login com email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@example.com',
          password: 'qualquersenha',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL || 'admin@mestredb.com',
          password: 'senhaErrada123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar login sem email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'MinhaSenh@123',
        });

      expect(response.status).toBe(400);
    });

    it('deve rejeitar login sem senha', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@mestredb.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('deve retornar dados do usuário autenticado', async () => {
      if (!adminToken) {
        console.warn('Pulando teste: token não disponível');
        return;
      }

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('is_superuser');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve rejeitar requisição sem token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('deve renovar token com refresh token válido', async () => {
      // Primeiro faz login para obter refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: process.env.ADMIN_EMAIL || 'admin@mestredb.com',
          password: process.env.ADMIN_PASSWORD || 'MinhaSenh@123',
        });

      if (loginResponse.status !== 200) {
        console.warn('Pulando teste: login falhou');
        return;
      }

      const { refreshToken } = loginResponse.body;

      // Tenta renovar token
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('deve rejeitar refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token_invalido' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('deve fazer logout com token válido', async () => {
      if (!adminToken) {
        console.warn('Pulando teste: token não disponível');
        return;
      }

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 204]).toContain(response.status);
    });

    it('deve rejeitar logout sem token', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
