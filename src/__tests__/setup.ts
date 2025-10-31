/**
 * Configuração global para testes
 * Este arquivo é executado antes de todos os testes
 */

// Configurar timezone para testes consistentes
process.env.TZ = 'UTC';

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Mock do console para testes mais limpos (opcional)
const originalConsole = console;

beforeAll(() => {
  // Silenciar logs durante os testes (descomente se necessário)
  // console.log = jest.fn();
  // console.warn = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  // Restaurar console original
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Configuração global para timeouts
jest.setTimeout(10000); // 10 segundos

// Mock global para Date se necessário (comentado por padrão)
// const mockDate = new Date('2024-01-01T00:00:00.000Z');
// global.Date = class extends Date {
//   constructor(...args: any[]) {
//     super(...args);
//     if (args.length === 0) {
//       return mockDate;
//     }
//   }
//   
//   static now() {
//     return mockDate.getTime();
//   }
// } as any;

// Configurações adicionais podem ser adicionadas aqui
export {};