import request from 'supertest';
import { Express } from 'express';
import { DataSource } from 'typeorm';
import { AppFactory } from '../../main/factories/AppFactory';
import { DatabaseConfig } from '../../infrastructure/config/database';

describe('Soft Delete - Integration Tests', () => {
  let app: Express;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Inicializar aplicação
    dataSource = await DatabaseConfig.initialize();
    app = await AppFactory.create();

    // Login como admin
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@mestredb.com',
        password: 'MinhaSenh@123',
      });
    adminToken = adminResponse.body.data.token;

    // Criar usuário de teste
    const createResponse = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Usuário Teste Soft Delete',
        email: 'teste.softdelete@email.com',
        password: 'Senha@123',
        is_superuser: false,
      });
    testUserId = createResponse.body.data.id;

    // Login como usuário normal
    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'teste.softdelete@email.com',
        password: 'Senha@123',
      });
    userToken = userResponse.body.data.token;
  });

  afterAll(async () => {
    // Limpar usuário de teste (hard delete)
    if (testUserId) {
      await request(app)
        .delete(`/api/usuarios/${testUserId}/permanent?confirm=true`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    await dataSource.destroy();
  });

  describe('DELETE /api/usuarios/:id - Soft Delete', () => {
    let softDeleteUserId: number;

    beforeEach(async () => {
      // Criar usuário para cada teste
      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Usuário Soft Delete',
          email: `softdelete.${Date.now()}@email.com`,
          password: 'Senha@123',
          is_superuser: false,
        });
      softDeleteUserId = response.body.data.id;
    });

    it('deve fazer soft delete e usuário não aparecer mais em GET', async () => {
      // Soft delete
      const deleteResponse = await request(app)
        .delete(`/api/usuarios/${softDeleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('Usuário deletado com sucesso');

      // Tentar buscar usuário deletado
      const getResponse = await request(app)
        .get(`/api/usuarios/${softDeleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('deve fazer soft delete e usuário não aparecer na listagem', async () => {
      // Soft delete
      await request(app)
        .delete(`/api/usuarios/${softDeleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Listar usuários
      const listResponse = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listResponse.status).toBe(200);
      const userIds = listResponse.body.data.map((u: any) => u.id);
      expect(userIds).not.toContain(softDeleteUserId);
    });

    it('deve permitir usuário deletar própria conta', async () => {
      // Login como usuário
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: `softdelete.${softDeleteUserId}@email.com`,
          password: 'Senha@123',
        });
      const token = loginResponse.body.data.token;

      // Deletar própria conta
      const deleteResponse = await request(app)
        .delete(`/api/usuarios/${softDeleteUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteResponse.status).toBe(200);
    });
  });

  describe('GET /api/usuarios/deleted/list', () => {
    let deletedUserId: number;

    beforeAll(async () => {
      // Criar e deletar usuário
      const createResponse = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Usuário Para Listar Deletado',
          email: `deleted.list.${Date.now()}@email.com`,
          password: 'Senha@123',
          is_superuser: false,
        });
      deletedUserId = createResponse.body.data.id;

      await request(app)
        .delete(`/api/usuarios/${deletedUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('deve listar usuários deletados (admin)', async () => {
      const response = await request(app)
        .get('/api/usuarios/deleted/list')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const deletedUser = response.body.data.find((u: any) => u.id === deletedUserId);
      expect(deletedUser).toBeDefined();
      expect(deletedUser.email).toContain('deleted.list');
    });

    it('deve rejeitar acesso de usuário normal', async () => {
      const response = await request(app)
        .get('/api/usuarios/deleted/list')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('deve rejeitar acesso sem autenticação', async () => {
      const response = await request(app)
        .get('/api/usuarios/deleted/list');

      expect(response.status).toBe(401);
    });

    it('deve paginar usuários deletados', async () => {
      const response = await request(app)
        .get('/api/usuarios/deleted/list?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/usuarios/:id/restore', () => {
    let restoreUserId: number;

    beforeEach(async () => {
      // Criar e deletar usuário
      const createResponse = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Usuário Para Restaurar',
          email: `restore.${Date.now()}@email.com`,
          password: 'Senha@123',
          is_superuser: false,
        });
      restoreUserId = createResponse.body.data.id;

      await request(app)
        .delete(`/api/usuarios/${restoreUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    it('deve restaurar usuário deletado com sucesso', async () => {
      const response = await request(app)
        .post(`/api/usuarios/${restoreUserId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuário restaurado com sucesso');
      expect(response.body.data.id).toBe(restoreUserId);

      // Verificar que usuário voltou
      const getResponse = await request(app)
        .get(`/api/usuarios/${restoreUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.id).toBe(restoreUserId);
    });

    it('deve rejeitar restauração de usuário não deletado', async () => {
      // Restaurar uma vez
      await request(app)
        .post(`/api/usuarios/${restoreUserId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Tentar restaurar novamente
      const response = await request(app)
        .post(`/api/usuarios/${restoreUserId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('não está deletado');
    });

    it('deve rejeitar restauração de usuário inexistente', async () => {
      const response = await request(app)
        .post('/api/usuarios/999999/restore')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('deve rejeitar acesso de usuário normal', async () => {
      const response = await request(app)
        .post(`/api/usuarios/${restoreUserId}/restore`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('deve permitir login após restauração', async () => {
      // Restaurar
      await request(app)
        .post(`/api/usuarios/${restoreUserId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Buscar email do usuário
      const getUserResponse = await request(app)
        .get(`/api/usuarios/${restoreUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const email = getUserResponse.body.data.email;

      // Tentar login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: email,
          password: 'Senha@123',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.data.token).toBeDefined();
    });
  });

  describe('DELETE /api/usuarios/:id/permanent', () => {
    let permanentDeleteUserId: number;

    beforeEach(async () => {
      // Criar usuário
      const createResponse = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Usuário Para Deletar Permanente',
          email: `permanent.${Date.now()}@email.com`,
          password: 'Senha@123',
          is_superuser: false,
        });
      permanentDeleteUserId = createResponse.body.data.id;
    });

    it('deve deletar permanentemente com confirmação', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${permanentDeleteUserId}/permanent?confirm=true`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuário deletado permanentemente');

      // Verificar que não existe mais (nem em deleted)
      const deletedResponse = await request(app)
        .get('/api/usuarios/deleted/list')
        .set('Authorization', `Bearer ${adminToken}`);

      const user = deletedResponse.body.data.find((u: any) => u.id === permanentDeleteUserId);
      expect(user).toBeUndefined();
    });

    it('deve rejeitar sem confirmação', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${permanentDeleteUserId}/permanent`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Confirmação obrigatória');
    });

    it('deve rejeitar hard delete da própria conta', async () => {
      // Buscar ID do admin
      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      const adminId = meResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/usuarios/${adminId}/permanent?confirm=true`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('própria conta');
    });

    it('deve rejeitar acesso de usuário normal', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${permanentDeleteUserId}/permanent?confirm=true`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('deve deletar permanentemente usuário soft deleted', async () => {
      // Soft delete primeiro
      await request(app)
        .delete(`/api/usuarios/${permanentDeleteUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Hard delete
      const response = await request(app)
        .delete(`/api/usuarios/${permanentDeleteUserId}/permanent?confirm=true`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Fluxo Completo - Soft Delete', () => {
    it('deve executar: criar → soft delete → listar deletados → restaurar → hard delete', async () => {
      // 1. Criar usuário
      const createResponse = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Usuário Fluxo Completo',
          email: `fluxo.${Date.now()}@email.com`,
          password: 'Senha@123',
          is_superuser: false,
        });

      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.data.id;

      // 2. Soft delete
      const deleteResponse = await request(app)
        .delete(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      // 3. Verificar que não aparece em GET normal
      const getResponse = await request(app)
        .get(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getResponse.status).toBe(404);

      // 4. Listar deletados e encontrar usuário
      const deletedResponse = await request(app)
        .get('/api/usuarios/deleted/list')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deletedResponse.status).toBe(200);
      const deletedUser = deletedResponse.body.data.find((u: any) => u.id === userId);
      expect(deletedUser).toBeDefined();

      // 5. Restaurar
      const restoreResponse = await request(app)
        .post(`/api/usuarios/${userId}/restore`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(restoreResponse.status).toBe(200);

      // 6. Verificar que voltou a aparecer
      const getAfterRestoreResponse = await request(app)
        .get(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getAfterRestoreResponse.status).toBe(200);

      // 7. Hard delete
      const hardDeleteResponse = await request(app)
        .delete(`/api/usuarios/${userId}/permanent?confirm=true`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(hardDeleteResponse.status).toBe(200);

      // 8. Verificar que não existe mais em lugar nenhum
      const finalGetResponse = await request(app)
        .get(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(finalGetResponse.status).toBe(404);

      const finalDeletedResponse = await request(app)
        .get('/api/usuarios/deleted/list')
        .set('Authorization', `Bearer ${adminToken}`);

      const finalUser = finalDeletedResponse.body.data.find((u: any) => u.id === userId);
      expect(finalUser).toBeUndefined();
    });
  });
});
