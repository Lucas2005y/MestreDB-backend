import { TokenBlacklistService } from '../../../application/services/TokenBlacklistService';

describe('TokenBlacklistService', () => {
  let tokenBlacklistService: TokenBlacklistService;

  beforeEach(() => {
    tokenBlacklistService = new TokenBlacklistService();
  });

  describe('addToBlacklist', () => {
    it('deve adicionar token à blacklist', () => {
      const token = 'test-token-123';

      tokenBlacklistService.addToBlacklist(token);

      expect(tokenBlacklistService.isBlacklisted(token)).toBe(true);
    });

    it('deve adicionar múltiplos tokens', () => {
      const token1 = 'token-1';
      const token2 = 'token-2';

      tokenBlacklistService.addToBlacklist(token1);
      tokenBlacklistService.addToBlacklist(token2);

      expect(tokenBlacklistService.isBlacklisted(token1)).toBe(true);
      expect(tokenBlacklistService.isBlacklisted(token2)).toBe(true);
    });

    it('não deve duplicar tokens', () => {
      const token = 'duplicate-token';

      tokenBlacklistService.addToBlacklist(token);
      tokenBlacklistService.addToBlacklist(token);

      expect(tokenBlacklistService.getBlacklistSize()).toBe(1);
    });
  });

  describe('isBlacklisted', () => {
    it('deve retornar false para token não blacklisted', () => {
      const result = tokenBlacklistService.isBlacklisted('non-existent-token');

      expect(result).toBe(false);
    });

    it('deve retornar true para token blacklisted', () => {
      const token = 'blacklisted-token';
      tokenBlacklistService.addToBlacklist(token);

      const result = tokenBlacklistService.isBlacklisted(token);

      expect(result).toBe(true);
    });

    it('deve ser case-sensitive', () => {
      tokenBlacklistService.addToBlacklist('Token123');

      expect(tokenBlacklistService.isBlacklisted('Token123')).toBe(true);
      expect(tokenBlacklistService.isBlacklisted('token123')).toBe(false);
    });
  });

  describe('removeFromBlacklist', () => {
    it('deve remover token da blacklist', () => {
      const token = 'token-to-remove';
      tokenBlacklistService.addToBlacklist(token);

      tokenBlacklistService.removeFromBlacklist(token);

      expect(tokenBlacklistService.isBlacklisted(token)).toBe(false);
    });

    it('não deve causar erro ao remover token inexistente', () => {
      expect(() => {
        tokenBlacklistService.removeFromBlacklist('non-existent');
      }).not.toThrow();
    });

    it('deve manter outros tokens após remoção', () => {
      tokenBlacklistService.addToBlacklist('token1');
      tokenBlacklistService.addToBlacklist('token2');

      tokenBlacklistService.removeFromBlacklist('token1');

      expect(tokenBlacklistService.isBlacklisted('token1')).toBe(false);
      expect(tokenBlacklistService.isBlacklisted('token2')).toBe(true);
    });
  });

  describe('clearBlacklist', () => {
    it('deve limpar toda a blacklist', () => {
      tokenBlacklistService.addToBlacklist('token1');
      tokenBlacklistService.addToBlacklist('token2');
      tokenBlacklistService.addToBlacklist('token3');

      tokenBlacklistService.clearBlacklist();

      expect(tokenBlacklistService.getBlacklistSize()).toBe(0);
      expect(tokenBlacklistService.isBlacklisted('token1')).toBe(false);
      expect(tokenBlacklistService.isBlacklisted('token2')).toBe(false);
      expect(tokenBlacklistService.isBlacklisted('token3')).toBe(false);
    });

    it('deve funcionar em blacklist vazia', () => {
      expect(() => {
        tokenBlacklistService.clearBlacklist();
      }).not.toThrow();

      expect(tokenBlacklistService.getBlacklistSize()).toBe(0);
    });
  });

  describe('getBlacklistSize', () => {
    it('deve retornar 0 para blacklist vazia', () => {
      expect(tokenBlacklistService.getBlacklistSize()).toBe(0);
    });

    it('deve retornar tamanho correto', () => {
      tokenBlacklistService.addToBlacklist('token1');
      tokenBlacklistService.addToBlacklist('token2');
      tokenBlacklistService.addToBlacklist('token3');

      expect(tokenBlacklistService.getBlacklistSize()).toBe(3);
    });

    it('deve atualizar após remoções', () => {
      tokenBlacklistService.addToBlacklist('token1');
      tokenBlacklistService.addToBlacklist('token2');
      expect(tokenBlacklistService.getBlacklistSize()).toBe(2);

      tokenBlacklistService.removeFromBlacklist('token1');
      expect(tokenBlacklistService.getBlacklistSize()).toBe(1);
    });
  });

  describe('Cenários de uso real', () => {
    it('deve gerenciar logout de múltiplos usuários', () => {
      const userTokens = [
        'user1-access-token',
        'user1-refresh-token',
        'user2-access-token',
        'user2-refresh-token'
      ];

      userTokens.forEach(token => tokenBlacklistService.addToBlacklist(token));

      expect(tokenBlacklistService.getBlacklistSize()).toBe(4);
      userTokens.forEach(token => {
        expect(tokenBlacklistService.isBlacklisted(token)).toBe(true);
      });
    });

    it('deve permitir revalidação após limpeza', () => {
      const token = 'expired-token';

      tokenBlacklistService.addToBlacklist(token);
      expect(tokenBlacklistService.isBlacklisted(token)).toBe(true);

      tokenBlacklistService.removeFromBlacklist(token);
      expect(tokenBlacklistService.isBlacklisted(token)).toBe(false);
    });
  });
});
