/**
 * Registro de Serviços
 * Configura todas as dependências do projeto seguindo a Clean Architecture
 */

import { DataSource } from 'typeorm';
import { container } from './DIContainer';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { UserRepositoryTestAdapter } from '../../__tests__/integration/repositories/UserRepository.test.adapter';
import { UserUseCases } from '../../application/usecases/UserUseCases';
import { AuthUseCases } from '../../application/usecases/AuthUseCases';
import { UserController } from '../../presentation/controllers/UserController';
import { AuthController } from '../../presentation/controllers/AuthController';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { PasswordService } from '../../application/services/PasswordService';
import { TokenService } from '../../application/services/TokenService';
import { ValidationService } from '../../application/services/ValidationService';
import { TokenBlacklistService } from '../../application/services/TokenBlacklistService';
import { RateLimitingService } from '../../application/services/RateLimitingService';

// Símbolos para identificação dos serviços
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  
  // Services
  PasswordService: Symbol.for('PasswordService'),
  TokenService: Symbol.for('TokenService'),
  ValidationService: Symbol.for('ValidationService'),
  TokenBlacklistService: Symbol.for('TokenBlacklistService'),
  RateLimitingService: Symbol.for('RateLimitingService'),
  
  // Use Cases
  UserUseCases: Symbol.for('UserUseCases'),
  AuthUseCases: Symbol.for('AuthUseCases'),
  
  // Controllers
  UserController: Symbol.for('UserController'),
  AuthController: Symbol.for('AuthController'),
} as const;

/**
 * Configura todas as dependências do projeto
 */
export function configureServices(customDataSource?: DataSource): void {
  // Registra o repositório como singleton
  container.registerSingleton<IUserRepository>(
    TYPES.UserRepository,
    () => {
      // Se um DataSource customizado for fornecido (para testes), usa o UserRepositoryTestAdapter
      if (customDataSource) {
        return new UserRepositoryTestAdapter(customDataSource);
      }
      // Caso contrário, usa o UserRepository padrão
      return new UserRepository();
    }
  );

  // Registra os serviços como singleton
  container.registerSingleton<PasswordService>(
    TYPES.PasswordService,
    () => new PasswordService()
  );

  container.registerSingleton<TokenService>(
    TYPES.TokenService,
    () => {
      const tokenBlacklistService = container.resolve<TokenBlacklistService>(TYPES.TokenBlacklistService);
      return new TokenService(tokenBlacklistService);
    }
  );

  container.registerSingleton<ValidationService>(
    TYPES.ValidationService,
    () => new ValidationService()
  );

  container.registerSingleton<TokenBlacklistService>(
    TYPES.TokenBlacklistService,
    () => new TokenBlacklistService()
  );

  container.registerSingleton<RateLimitingService>(
    TYPES.RateLimitingService,
    () => new RateLimitingService()
  );

  // Registra os use cases como singleton
  container.registerSingleton<UserUseCases>(
    TYPES.UserUseCases,
    () => {
      const userRepository = container.resolve<IUserRepository>(TYPES.UserRepository);
      const passwordService = container.resolve<PasswordService>(TYPES.PasswordService);
      return new UserUseCases(userRepository, passwordService);
    }
  );

  container.registerSingleton<AuthUseCases>(
    TYPES.AuthUseCases,
    () => {
      const userRepository = container.resolve<IUserRepository>(TYPES.UserRepository);
      const passwordService = container.resolve<PasswordService>(TYPES.PasswordService);
      const tokenService = container.resolve<TokenService>(TYPES.TokenService);
      const validationService = container.resolve<ValidationService>(TYPES.ValidationService);
      return new AuthUseCases(userRepository, passwordService, tokenService, validationService);
    }
  );

  // Registra os controllers (não precisam ser singleton)
  container.register<UserController>(
    TYPES.UserController,
    () => {
      const userUseCases = container.resolve<UserUseCases>(TYPES.UserUseCases);
      return new UserController(userUseCases);
    }
  );

  container.register<AuthController>(
    TYPES.AuthController,
    () => {
      const authUseCases = container.resolve<AuthUseCases>(TYPES.AuthUseCases);
      return new AuthController(authUseCases);
    }
  );
}

/**
 * Factory para criar instâncias dos controllers
 */
export class ControllerFactory {
  static createUserController(): UserController {
    return container.resolve<UserController>(TYPES.UserController);
  }

  static createAuthController(): AuthController {
    return container.resolve<AuthController>(TYPES.AuthController);
  }
}