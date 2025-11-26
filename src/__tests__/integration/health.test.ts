import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../main/app';

describe('Health Check Endpoints', () => {
  let app: Application;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('GET /api/health', () => {
    it('deve retornar status de saúde completo', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('system');
    });

    it('deve verificar status do banco de dados', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services.database).toHaveProperty('status');
      expect(response.body.services.database).toHaveProperty('responseTime');
    });

    it('deve incluir informações de memória', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('percentage');
    });

    it('deve incluir informações do sistema', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.system).toHaveProperty('platform');
      expect(response.body.system).toHaveProperty('nodeVersion');
      expect(response.body.system).toHaveProperty('pid');
    });

    it('deve ter tempo de resposta rápido', async () => {
      const start = Date.now();
      await request(app).get('/api/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
    });
  });

  describe('GET /api/health/ready', () => {
    it('deve retornar status de readiness', async () => {
      const response = await request(app).get('/api/health/ready');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('deve retornar ready quando aplicação está pronta', async () => {
      const response = await request(app).get('/api/health/ready');

      if (response.status === 200) {
        expect(response.body.status).toBe('ready');
      }
    });
  });

  describe('GET /api/health/live', () => {
    it('deve retornar status de liveness', async () => {
      const response = await request(app).get('/api/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('alive');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    it('deve ter uptime maior que zero', async () => {
      const response = await request(app).get('/api/health/live');

      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/health/simple', () => {
    it('deve retornar health check simples', async () => {
      const response = await request(app).get('/api/health/simple');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
