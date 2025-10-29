/**
 * ValidationService - Centraliza todas as validações da aplicação
 * 
 * Este serviço implementa validações comuns reutilizáveis seguindo os princípios
 * da Clean Architecture, separando a lógica de validação da lógica de negócio.
 */

// Interfaces para resultados de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customMessage?: string;
}

export interface LoginValidationData {
  email: string;
  password: string;
}

export interface RegisterValidationData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserValidationData {
  name?: string;
  email?: string;
  password?: string;
}

export class ValidationService {
  
  // ========================================
  // VALIDAÇÕES BÁSICAS DE CAMPOS
  // ========================================

  /**
   * Valida se um campo é obrigatório
   */
  validateRequired(value: any, fieldName: string): ValidationResult {
    const errors: string[] = [];
    
    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} é obrigatório`);
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      errors.push(`${fieldName} não pode estar vazio`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida o tamanho de uma string
   */
  validateStringLength(
    value: string, 
    fieldName: string, 
    minLength?: number, 
    maxLength?: number
  ): ValidationResult {
    const errors: string[] = [];
    
    if (minLength && value.length < minLength) {
      errors.push(`${fieldName} deve ter pelo menos ${minLength} caracteres`);
    }
    
    if (maxLength && value.length > maxLength) {
      errors.push(`${fieldName} deve ter no máximo ${maxLength} caracteres`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de email
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email é obrigatório');
      return { isValid: false, errors };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email deve ter um formato válido');
    }
    
    if (email.length > 254) {
      errors.push('Email deve ter no máximo 254 caracteres');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida ID numérico
   */
  validateId(id: any, fieldName: string = 'ID'): ValidationResult {
    const errors: string[] = [];
    
    if (!id) {
      errors.push(`${fieldName} é obrigatório`);
      return { isValid: false, errors };
    }
    
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      errors.push(`${fieldName} deve ser um número positivo válido`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida formato de token Bearer
   */
  validateBearerToken(authHeader: string): ValidationResult {
    const errors: string[] = [];
    
    if (!authHeader) {
      errors.push('Token de acesso é obrigatório');
      return { isValid: false, errors };
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      errors.push('Formato do token deve ser: Bearer <token>');
    }
    
    const token = authHeader.substring(7);
    if (!token || token.trim() === '') {
      errors.push('Token não pode estar vazio');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extrai token do header Authorization
   */
  extractTokenFromHeader(authHeader: string): string | null {
    const validation = this.validateBearerToken(authHeader);
    if (!validation.isValid) {
      return null;
    }
    
    return authHeader.substring(7);
  }

  // ========================================
  // VALIDAÇÕES DE NEGÓCIO ESPECÍFICAS
  // ========================================

  /**
   * Valida dados de login
   */
  validateLoginData(data: LoginValidationData): ValidationResult {
    const errors: string[] = [];
    
    // Validar email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
    
    // Validar senha
    const passwordValidation = this.validateRequired(data.password, 'Senha');
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    } else {
      // Validação mínima de tamanho para login
      const lengthValidation = this.validateStringLength(data.password, 'Senha', 6);
      if (!lengthValidation.isValid) {
        errors.push(...lengthValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de registro
   */
  validateRegisterData(data: RegisterValidationData): ValidationResult {
    const errors: string[] = [];
    
    // Validar nome
    const nameValidation = this.validateRequired(data.name, 'Nome');
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      const nameLengthValidation = this.validateStringLength(data.name, 'Nome', 2, 80);
      if (!nameLengthValidation.isValid) {
        errors.push(...nameLengthValidation.errors);
      }
    }
    
    // Validar email
    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
    
    // Validar senha
    const passwordValidation = this.validateRequired(data.password, 'Senha');
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    } else {
      // Para registro, exigir pelo menos 8 caracteres
      const lengthValidation = this.validateStringLength(data.password, 'Senha', 8, 128);
      if (!lengthValidation.isValid) {
        errors.push(...lengthValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida dados de atualização de usuário
   */
  validateUpdateUserData(data: UpdateUserValidationData): ValidationResult {
    const errors: string[] = [];
    
    // Nome (opcional, mas se fornecido deve ser válido)
    if (data.name !== undefined) {
      if (data.name === null || data.name === '') {
        errors.push('Nome não pode estar vazio');
      } else {
        const nameLengthValidation = this.validateStringLength(data.name, 'Nome', 2, 80);
        if (!nameLengthValidation.isValid) {
          errors.push(...nameLengthValidation.errors);
        }
      }
    }
    
    // Email (opcional, mas se fornecido deve ser válido)
    if (data.email !== undefined) {
      const emailValidation = this.validateEmail(data.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }
    
    // Senha (opcional, mas se fornecida deve ser válida)
    if (data.password !== undefined) {
      if (data.password === null || data.password === '') {
        errors.push('Senha não pode estar vazia');
      } else {
        const lengthValidation = this.validateStringLength(data.password, 'Senha', 8, 128);
        if (!lengthValidation.isValid) {
          errors.push(...lengthValidation.errors);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida token de refresh
   */
  validateRefreshTokenData(refreshToken: string): ValidationResult {
    const errors: string[] = [];
    
    if (!refreshToken) {
      errors.push('Refresh token é obrigatório');
    } else if (refreshToken.trim() === '') {
      errors.push('Refresh token não pode estar vazio');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ========================================
  // VALIDAÇÕES DE AUTORIZAÇÃO
  // ========================================

  /**
   * Valida se usuário tem permissão de superuser
   */
  validateSuperuserPermission(isSuperuser: boolean): ValidationResult {
    const errors: string[] = [];
    
    if (!isSuperuser) {
      errors.push('Acesso negado: privilégios de administrador necessários');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida se usuário pode acessar recurso próprio ou é admin
   */
  validateOwnershipOrAdmin(
    currentUserId: number, 
    targetUserId: number, 
    isSuperuser: boolean
  ): ValidationResult {
    const errors: string[] = [];
    
    if (currentUserId !== targetUserId && !isSuperuser) {
      errors.push('Acesso negado: você só pode acessar seus próprios dados');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida tentativa de definir privilégios de superuser
   */
  validateSuperuserAssignment(
    requestData: any, 
    currentUserIsSuperuser: boolean
  ): ValidationResult {
    const errors: string[] = [];
    
    if (requestData.is_superuser !== undefined && !currentUserIsSuperuser) {
      errors.push('Acesso negado: apenas administradores podem definir privilégios de superusuário');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ========================================
  // UTILITÁRIOS DE VALIDAÇÃO
  // ========================================

  /**
   * Combina múltiplos resultados de validação
   */
  combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    
    for (const result of results) {
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }

  /**
   * Valida campo genérico com opções customizáveis
   */
  validateField(
    value: any, 
    fieldName: string, 
    options: FieldValidationOptions = {}
  ): ValidationResult {
    const errors: string[] = [];
    
    // Verificar se é obrigatório
    if (options.required) {
      const requiredValidation = this.validateRequired(value, fieldName);
      if (!requiredValidation.isValid) {
        errors.push(...requiredValidation.errors);
        return { isValid: false, errors };
      }
    }
    
    // Se valor está presente, validar outras regras
    if (value !== null && value !== undefined && value !== '') {
      // Validar tamanho se for string
      if (typeof value === 'string') {
        const lengthValidation = this.validateStringLength(
          value, 
          fieldName, 
          options.minLength, 
          options.maxLength
        );
        if (!lengthValidation.isValid) {
          errors.push(...lengthValidation.errors);
        }
        
        // Validar padrão regex se fornecido
        if (options.pattern && !options.pattern.test(value)) {
          errors.push(options.customMessage || `${fieldName} não atende ao formato exigido`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}