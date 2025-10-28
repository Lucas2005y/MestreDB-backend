/**
 * Container de Injeção de Dependência
 * Gerencia a criação e resolução de dependências seguindo os princípios da Clean Architecture
 */

type Constructor<T = {}> = new (...args: any[]) => T;
type ServiceIdentifier<T = any> = string | symbol | Constructor<T>;

interface ServiceDefinition {
  factory: () => any;
  singleton: boolean;
  instance?: any;
}

export class DIContainer {
  private services = new Map<ServiceIdentifier, ServiceDefinition>();

  /**
   * Registra um serviço no container
   */
  register<T>(
    identifier: ServiceIdentifier<T>,
    factory: () => T,
    options: { singleton?: boolean } = {}
  ): void {
    this.services.set(identifier, {
      factory,
      singleton: options.singleton ?? false,
    });
  }

  /**
   * Registra um singleton no container
   */
  registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    factory: () => T
  ): void {
    this.register(identifier, factory, { singleton: true });
  }

  /**
   * Resolve uma dependência do container
   */
  resolve<T>(identifier: ServiceIdentifier<T>): T {
    const service = this.services.get(identifier);
    
    if (!service) {
      throw new Error(`Service ${String(identifier)} not found in container`);
    }

    if (service.singleton) {
      if (!service.instance) {
        service.instance = service.factory();
      }
      return service.instance;
    }

    return service.factory();
  }

  /**
   * Verifica se um serviço está registrado
   */
  has(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier);
  }

  /**
   * Remove um serviço do container
   */
  unregister(identifier: ServiceIdentifier): void {
    this.services.delete(identifier);
  }

  /**
   * Limpa todos os serviços do container
   */
  clear(): void {
    this.services.clear();
  }
}

// Instância global do container
export const container = new DIContainer();