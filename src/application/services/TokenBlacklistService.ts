export class TokenBlacklistService {
  private blacklistedTokens: Set<string> = new Set();

  /**
   * Adiciona um token à blacklist
   */
  addToBlacklist(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * Verifica se um token está na blacklist
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remove um token da blacklist (opcional, para limpeza)
   */
  removeFromBlacklist(token: string): void {
    this.blacklistedTokens.delete(token);
  }

  /**
   * Limpa todos os tokens da blacklist (opcional, para manutenção)
   */
  clearBlacklist(): void {
    this.blacklistedTokens.clear();
  }

  /**
   * Retorna o número de tokens na blacklist
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }
}