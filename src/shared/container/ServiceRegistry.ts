/**
 * Registro de Serviços
 * Configura todas as dependências do projeto seguindo a Clean Architecture
 */

import { container } from './DIContainer';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { UserUseCases } from '../../application/usecases/UserUseCases';
import { UserController } from '../../presentation/controllers/UserController';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

// Símbolos para identificação dos serviços
export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  
  // Use Cases
  UserUseCases: Symbol.for('UserUseCases'),
  
  // Controllers
  UserController: Symbol.for('UserController'),
} as const;

/**
 * Configura todas as dependências do projeto
 */
export function configureServices(): void {
  // Registra o repositório como singleton
  container.registerSingleton<IUserRepository>(
    TYPES.UserRepository,
    () => new UserRepository()
  );

  // Registra os use cases como singleton
  container.registerSingleton<UserUseCases>(
    TYPES.UserUseCases,
    () => {
      const userRepository = container.resolve<IUserRepository>(TYPES.UserRepository);
      return new UserUseCases(userRepository);
    }
  );

  // Registra o controller (não precisa ser singleton)
  container.register<UserController>(
    TYPES.UserController,
    () => {
      const userUseCases = container.resolve<UserUseCases>(TYPES.UserUseCases);
      return new UserController(userUseCases);
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
}