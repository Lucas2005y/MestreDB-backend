interface RateLimitAttempt {
  count: number;
  firstAttempt: Date;
  lastAttempt: Date;
  blockedUntil?: Date;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockMinutes: number;
}

export class RateLimitingService {
  private attempts: Map<string, RateLimitAttempt> = new Map();
  private config: RateLimitConfig;

  constructor() {
    // Configuração de produção para rate limiting
    this.config = {
      maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5'), // 5 tentativas permitidas
      windowMinutes: parseFloat(process.env.RATE_LIMIT_WINDOW_MINUTES || '15'), // Janela de 15 minutos
      blockMinutes: parseFloat(process.env.RATE_LIMIT_BLOCK_MINUTES || '15') // Bloqueio de 15 minutos
    };

    console.log('🔧 RateLimitingService inicializado com configuração de produção:', {
      maxAttempts: this.config.maxAttempts,
      windowMinutes: this.config.windowMinutes,
      blockMinutes: this.config.blockMinutes
    });

    // Limpeza automática a cada minuto
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Verifica se um IP/email pode fazer uma tentativa de login
   */
  canAttempt(identifier: string): { allowed: boolean; remainingTime?: number; attemptsLeft?: number } {
    const now = new Date();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      return { allowed: true, attemptsLeft: this.config.maxAttempts };
    }

    // Verificar se ainda está bloqueado
    if (attempt.blockedUntil && now < attempt.blockedUntil) {
      const remainingTime = Math.ceil((attempt.blockedUntil.getTime() - now.getTime()) / 1000);
      console.log(`🚫 Tentativa bloqueada para ${identifier}. Tempo restante: ${remainingTime}s`);
      return { allowed: false, remainingTime };
    }

    // Verificar se a janela de tempo expirou
    const windowExpired = now.getTime() - attempt.firstAttempt.getTime() > (this.config.windowMinutes * 60 * 1000);
    if (windowExpired) {
      // Reset do contador se a janela expirou
      this.attempts.delete(identifier);
      console.log(`🔄 Janela de tempo expirada para ${identifier}. Contador resetado.`);
      return { allowed: true, attemptsLeft: this.config.maxAttempts };
    }

    // Verificar se ainda tem tentativas disponíveis
    const attemptsLeft = this.config.maxAttempts - attempt.count;
    if (attemptsLeft > 0) {
      return { allowed: true, attemptsLeft };
    }

    // Bloquear se excedeu o limite
    const blockUntil = new Date(now.getTime() + (this.config.blockMinutes * 60 * 1000));
    attempt.blockedUntil = blockUntil;
    this.attempts.set(identifier, attempt);

    const remainingTime = Math.ceil((blockUntil.getTime() - now.getTime()) / 1000);
    console.log(`🚫 Limite excedido para ${identifier}. Bloqueado por ${remainingTime}s`);
    
    return { allowed: false, remainingTime };
  }

  /**
   * Registra uma tentativa de login (sucesso ou falha)
   */
  recordAttempt(identifier: string, success: boolean): void {
    const now = new Date();
    const attempt = this.attempts.get(identifier);

    if (success) {
      // Reset em caso de sucesso
      this.attempts.delete(identifier);
      console.log(`✅ Login bem-sucedido para ${identifier}. Contador resetado.`);
      return;
    }

    if (!attempt) {
      // Primeira tentativa falhada
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
      console.log(`⚠️ Primeira tentativa falhada registrada para ${identifier}`);
    } else {
      // Incrementar contador de tentativas
      attempt.count++;
      attempt.lastAttempt = now;
      this.attempts.set(identifier, attempt);
      console.log(`⚠️ Tentativa falhada #${attempt.count} registrada para ${identifier}`);
    }
  }

  /**
   * Obtém estatísticas de rate limiting para um identificador
   */
  getStats(identifier: string): { attempts: number; blockedUntil?: Date; windowExpires?: Date } | null {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return null;

    const windowExpires = new Date(attempt.firstAttempt.getTime() + (this.config.windowMinutes * 60 * 1000));
    
    return {
      attempts: attempt.count,
      blockedUntil: attempt.blockedUntil,
      windowExpires
    };
  }

  /**
   * Limpa registros expirados
   */
  private cleanup(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [identifier, attempt] of this.attempts.entries()) {
      const windowExpired = now.getTime() - attempt.firstAttempt.getTime() > (this.config.windowMinutes * 60 * 1000);
      const blockExpired = !attempt.blockedUntil || now > attempt.blockedUntil;

      if (windowExpired && blockExpired) {
        this.attempts.delete(identifier);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Limpeza automática: ${cleaned} registros expirados removidos`);
    }
  }

  /**
   * Atualiza configuração (útil para testes)
   */
  updateConfig(newConfig: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Configuração de rate limiting atualizada:', this.config);
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): RateLimitConfig {
    return { ...this.config };
  }

  /**
   * Reset completo (útil para testes)
   */
  reset(): void {
    this.attempts.clear();
    console.log('🔄 Rate limiting resetado completamente');
  }
}