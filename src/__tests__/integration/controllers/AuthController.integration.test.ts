import request from 'supertest';
import { DataSource, Not } from 'typeorm';
import { Application } from 'express';
import { AppFactory } from '../../../main/factories/AppFactory';
import { TestDataSource } from '../setup';
import { UserTest } from '../entities/User.test';
import { configureServices } from '../../../shared/container/ServiceRegistry';
import { container } from '../../../shared/container/DIContainer';
import { TYPES } from '../../../shared/container/ServiceRegistry';
import { RateLimitingService } from '../../../application/services/RateLimitingService';
import { PasswordService } from '../../../application/services/PasswordService';
import { IUserRepository } from '../../../domain/interfaces/IUserRepository';
import bcrypt from 'bcrypt';

describe('AuthController Integration Tests', () => {
  let app: Application;
  let dataSource: DataSource;
  let testUser: UserTest;

  beforeAll(async () => {
    console.log('🔧 Iniciando configuração do beforeAll...');
    
    // Usar o banco de dados de teste configurado
    console.log('🔧 Configurando dataSource...');
    dataSource = TestDataSource;
    
    // Inicializar o banco de dados de teste
    console.log('🔧 Inicializando TestDataSource...');
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    console.log('✅ TestDataSource inicializado');
    
    // Configurar serviços do container DI com TestDataSource
    console.log('🔧 Configurando serviços...');
    configureServices(dataSource);
    console.log('✅ Serviços configurados');
    
    // Criar aplicação
    console.log('🔧 Criando aplicação...');
    app = await AppFactory.create();
    console.log('✅ Aplicação criada');
    console.log('✅ beforeAll concluído');
  });

  beforeEach(async () => {
    // Criar usuário de teste antes de cada teste (após o clearDatabase do setup)
    console.log('🔧 Criando usuário de teste no beforeEach...');
    const userRepository = container.resolve<IUserRepository>(TYPES.UserRepository);
    
    testUser = await userRepository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      is_superuser: false
    });
    
 console.log('✅ Usuário de teste criado no beforeEach:', testUser);
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
    // Limpar dados entre testes (exceto o usuário de teste)
    const userRepository = dataSource.getRepository(UserTest);
    await userRepository.delete({ id: Not(testUser.id) });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      console.log('🔍 Iniciando teste de login...');
      console.log('🔍 App definido:', !!app);
      console.log('🔍 DataSource inicializado:', dataSource.isInitialized);
      console.log('🔍 Usuário de teste criado:', !!testUser);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Log temporário para debug
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response body:', response.body);
      
      if (response.status !== 200) {
        console.log('❌ Teste falhou - Status esperado: 200, recebido:', response.status);
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login realizado com sucesso');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 400 quando email não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('message', 'Email e senha são obrigatórios');
    });

    it('deve retornar erro 400 quando senha não for fornecida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Dados inválidos');
      expect(response.body).toHaveProperty('message', 'Email e senha são obrigatórios');
    });

    it('deve retornar erro 400 quando senha for muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 401 com email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 401 com senha inválida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário com dados válidos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Usuário registrado com sucesso');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name', 'New User');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar erro 400 quando nome não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser2@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 400 quando email não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 400 quando senha não for fornecida', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser3@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 400 quando senha for muito curta', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser4@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('deve retornar erro 409 quando email já existir', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com', // Email já existe
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      // Fazer login para obter token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = loginResponse.body.token;
    });

    it('deve fazer logout com token válido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logout realizado com sucesso');
    });

    it('deve retornar erro 401 sem token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 401 com token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});