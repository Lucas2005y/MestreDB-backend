/**
 * Parâmetros de paginação para requisições
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Metadados de paginação para respostas
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Resposta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Opções para construir resposta paginada
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

/**
 * Helper para criar resposta paginada
 */
export class PaginationHelper {
  /**
   * Valores padrão de paginação
   */
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_LIMIT = 10;
  static readonly MAX_LIMIT = 100;
  static readonly MIN_LIMIT = 1;

  /**
   * Valida e normaliza parâmetros de paginação
   */
  static validateParams(params: Partial<PaginationParams>): PaginationParams {
    const page = Math.max(1, Number(params.page) || this.DEFAULT_PAGE);

    const rawLimit = Number(params.limit) || this.DEFAULT_LIMIT;
    const limit = rawLimit <= 0
      ? this.DEFAULT_LIMIT
      : Math.min(this.MAX_LIMIT, rawLimit);

    const sortOrder = params.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    return {
      page,
      limit,
      sortBy: params.sortBy,
      sortOrder,
    };
  }

  /**
   * Calcula offset para query no banco
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Cria metadados de paginação
   */
  static createMeta(options: PaginationOptions): PaginationMeta {
    const { page, limit, total } = options;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Cria resposta paginada completa
   */
  static createResponse<T>(
    data: T[],
    options: PaginationOptions
  ): PaginatedResponse<T> {
    return {
      data,
      pagination: this.createMeta(options),
    };
  }

  /**
   * Extrai parâmetros de paginação de query string
   */
  static fromQuery(query: any): PaginationParams {
    return this.validateParams({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
