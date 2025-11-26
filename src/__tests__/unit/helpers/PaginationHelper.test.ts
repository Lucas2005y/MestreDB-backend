import { PaginationHelper } from '../../../application/dtos/PaginationDTO';

describe('PaginationHelper', () => {
  describe('validateParams', () => {
    it('deve usar valores padrão quando não fornecidos', () => {
      const result = PaginationHelper.validateParams({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortOrder).toBe('ASC');
    });

    it('deve aceitar valores válidos', () => {
      const result = PaginationHelper.validateParams({
        page: 5,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'DESC',
      });

      expect(result.page).toBe(5);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe('name');
      expect(result.sortOrder).toBe('DESC');
    });

    it('deve corrigir page negativo para 1', () => {
      const result = PaginationHelper.validateParams({ page: -5 });

      expect(result.page).toBe(1);
    });

    it('deve corrigir page zero para 1', () => {
      const result = PaginationHelper.validateParams({ page: 0 });

      expect(result.page).toBe(1);
    });

    it('deve limitar limit ao máximo (100)', () => {
      const result = PaginationHelper.validateParams({ limit: 200 });

      expect(result.limit).toBe(100);
    });

    it('deve corrigir limit negativo para padrão', () => {
      const result = PaginationHelper.validateParams({ limit: -10 });

      expect(result.limit).toBe(10);
    });

    it('deve corrigir limit zero para padrão', () => {
      const result = PaginationHelper.validateParams({ limit: 0 });

      expect(result.limit).toBe(10);
    });

    it('deve normalizar sortOrder para uppercase', () => {
      const result1 = PaginationHelper.validateParams({ sortOrder: 'desc' as any });
      const result2 = PaginationHelper.validateParams({ sortOrder: 'asc' as any });

      expect(result1.sortOrder).toBe('DESC');
      expect(result2.sortOrder).toBe('ASC');
    });

    it('deve usar ASC como padrão para sortOrder inválido', () => {
      const result = PaginationHelper.validateParams({ sortOrder: 'invalid' as any });

      expect(result.sortOrder).toBe('ASC');
    });
  });

  describe('calculateOffset', () => {
    it('deve calcular offset corretamente', () => {
      expect(PaginationHelper.calculateOffset(1, 10)).toBe(0);
      expect(PaginationHelper.calculateOffset(2, 10)).toBe(10);
      expect(PaginationHelper.calculateOffset(3, 10)).toBe(20);
      expect(PaginationHelper.calculateOffset(5, 20)).toBe(80);
      expect(PaginationHelper.calculateOffset(10, 5)).toBe(45);
    });

    it('deve retornar 0 para página 1', () => {
      expect(PaginationHelper.calculateOffset(1, 50)).toBe(0);
    });
  });

  describe('createMeta', () => {
    it('deve criar metadados corretos', () => {
      const meta = PaginationHelper.createMeta({
        page: 2,
        limit: 10,
        total: 45,
      });

      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(10);
      expect(meta.total).toBe(45);
      expect(meta.totalPages).toBe(5); // ceil(45/10)
      expect(meta.hasNext).toBe(true); // página 2 de 5
      expect(meta.hasPrev).toBe(true); // tem página 1
    });

    it('deve indicar hasNext=false na última página', () => {
      const meta = PaginationHelper.createMeta({
        page: 5,
        limit: 10,
        total: 45,
      });

      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
    });

    it('deve indicar hasPrev=false na primeira página', () => {
      const meta = PaginationHelper.createMeta({
        page: 1,
        limit: 10,
        total: 45,
      });

      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(false);
    });

    it('deve lidar com página única', () => {
      const meta = PaginationHelper.createMeta({
        page: 1,
        limit: 10,
        total: 5,
      });

      expect(meta.totalPages).toBe(1);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(false);
    });

    it('deve lidar com total zero', () => {
      const meta = PaginationHelper.createMeta({
        page: 1,
        limit: 10,
        total: 0,
      });

      expect(meta.totalPages).toBe(0);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(false);
    });

    it('deve calcular totalPages corretamente', () => {
      expect(
        PaginationHelper.createMeta({ page: 1, limit: 10, total: 100 }).totalPages
      ).toBe(10);
      expect(
        PaginationHelper.createMeta({ page: 1, limit: 10, total: 95 }).totalPages
      ).toBe(10);
      expect(
        PaginationHelper.createMeta({ page: 1, limit: 10, total: 91 }).totalPages
      ).toBe(10);
      expect(
        PaginationHelper.createMeta({ page: 1, limit: 20, total: 100 }).totalPages
      ).toBe(5);
    });
  });

  describe('createResponse', () => {
    it('deve criar resposta paginada completa', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = PaginationHelper.createResponse(data, {
        page: 1,
        limit: 10,
        total: 25,
      });

      expect(response.data).toEqual(data);
      expect(response.pagination).toBeDefined();
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.total).toBe(25);
      expect(response.pagination.totalPages).toBe(3);
    });

    it('deve funcionar com array vazio', () => {
      const response = PaginationHelper.createResponse([], {
        page: 1,
        limit: 10,
        total: 0,
      });

      expect(response.data).toEqual([]);
      expect(response.pagination.total).toBe(0);
    });
  });

  describe('fromQuery', () => {
    it('deve extrair parâmetros de query string', () => {
      const query = {
        page: '3',
        limit: '20',
        sortBy: 'name',
        sortOrder: 'DESC',
      };

      const params = PaginationHelper.fromQuery(query);

      expect(params.page).toBe(3);
      expect(params.limit).toBe(20);
      expect(params.sortBy).toBe('name');
      expect(params.sortOrder).toBe('DESC');
    });

    it('deve lidar com query vazia', () => {
      const params = PaginationHelper.fromQuery({});

      expect(params.page).toBe(1);
      expect(params.limit).toBe(10);
    });

    it('deve converter strings para números', () => {
      const query = {
        page: '5',
        limit: '25',
      };

      const params = PaginationHelper.fromQuery(query);

      expect(typeof params.page).toBe('number');
      expect(typeof params.limit).toBe('number');
      expect(params.page).toBe(5);
      expect(params.limit).toBe(25);
    });

    it('deve validar valores extraídos', () => {
      const query = {
        page: '-1',
        limit: '200',
      };

      const params = PaginationHelper.fromQuery(query);

      expect(params.page).toBe(1); // Corrigido
      expect(params.limit).toBe(100); // Limitado
    });
  });

  describe('Constantes', () => {
    it('deve ter constantes definidas', () => {
      expect(PaginationHelper.DEFAULT_PAGE).toBe(1);
      expect(PaginationHelper.DEFAULT_LIMIT).toBe(10);
      expect(PaginationHelper.MAX_LIMIT).toBe(100);
      expect(PaginationHelper.MIN_LIMIT).toBe(1);
    });
  });
});
