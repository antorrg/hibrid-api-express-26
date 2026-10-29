import crypto from 'node:crypto'
import envConfig from '../../configs/envConfig.js'
import { ERROR_CODE, type ErrorCode } from '../../configs/errors/errorCodes.js'

export interface HMACTokenOptions {
  secret?: string
  minSeconds?: number // Tiempo mínimo transcurrido para evitar bots (default: 3s en prod/dev)
  maxMinutes?: number // Tiempo máximo de validez antes de expirar (default: 15m)
}

export interface HMACTokenValidation {
  valid: boolean
  code?: ErrorCode
  message?: string
}

export abstract class HMACToken {
  private static readonly DEFAULT_MIN_SECONDS = 3
  private static readonly DEFAULT_MAX_MINUTES = 15
  private static readonly NONCE_BYTES = 16

  // Registro de nonces usados para evitar reutilización (One-Time Token)
  private static readonly usedNonces = new Map<string, number>()

  /**
   * Genera un token HMAC con nonce aleatorio y marca de tiempo embebida.
   * Formato: `${nonce}.${timestamp}.${firma}`
   */
  static create(secret?: string): string {
    const key = secret || envConfig.SessionSecret
    const nonce = crypto.randomBytes(this.NONCE_BYTES).toString('hex')
    const timestamp = Date.now().toString()
    const payload = `${nonce}:${timestamp}`
    const signature = crypto.createHmac('sha256', key).update(payload).digest('hex')

    return `${nonce}.${timestamp}.${signature}`
  }

  /**
   * Verifica la integridad de la firma HMAC, el tiempo transcurrido (anti-bot) y la expiración.
   */
  static verify(token: string | undefined | null, options: HMACTokenOptions = {}): HMACTokenValidation {
    if (!token || typeof token !== 'string') {
      return {
        valid: false,
        code: ERROR_CODE.MISSING_TOKEN,
        message: 'Token de seguridad requerido'
      }
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      return {
        valid: false,
        code: ERROR_CODE.INVALID_TOKEN,
        message: 'Formato de token de seguridad inválido'
      }
    }

    const [nonce, timestampStr, signature] = parts
    if (!nonce || !timestampStr || !signature) {
      return {
        valid: false,
        code: ERROR_CODE.INVALID_TOKEN,
        message: 'Estructura de token incompleta'
      }
    }

    const key = options.secret || envConfig.SessionSecret
    const payload = `${nonce}:${timestampStr}`
    const expectedSignature = crypto.createHmac('sha256', key).update(payload).digest('hex')

    const sigBuf = Buffer.from(signature, 'hex')
    const expectedBuf = Buffer.from(expectedSignature, 'hex')

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return {
        valid: false,
        code: ERROR_CODE.CSRF_DETECTED,
        message: 'Token de seguridad inválido o manipulado'
      }
    }

    const timestamp = Number(timestampStr)
    if (Number.isNaN(timestamp) || timestamp <= 0) {
      return {
        valid: false,
        code: ERROR_CODE.INVALID_TOKEN,
        message: 'Timestamp del token inválido'
      }
    }

    const now = Date.now()
    const elapsedMs = now - timestamp

    if (elapsedMs < -5000) {
      return {
        valid: false,
        code: ERROR_CODE.SUSPICIOUS_ACTIVITY,
        message: 'Timestamp sospechoso generado en el futuro'
      }
    }

    const defaultMinSeconds = envConfig.Status === 'test' ? 0 : this.DEFAULT_MIN_SECONDS
    const minSeconds = options.minSeconds ?? defaultMinSeconds
    if (elapsedMs < minSeconds * 1000) {
      return {
        valid: false,
        code: ERROR_CODE.SUSPICIOUS_ACTIVITY,
        message: 'Envío de formulario sospechosamente rápido (posible bot o spam)'
      }
    }

    const maxMinutes = options.maxMinutes ?? this.DEFAULT_MAX_MINUTES
    if (elapsedMs > maxMinutes * 60 * 1000) {
      return {
        valid: false,
        code: ERROR_CODE.EXPIRED_TOKEN,
        message: 'El formulario ha expirado. Por favor, recargue la página.'
      }
    }

    // Verificar si el nonce ya fue utilizado (One-Time Token)
    this.cleanExpiredNonces(maxMinutes)
    if (this.usedNonces.has(nonce)) {
      return {
        valid: false,
        code: ERROR_CODE.CSRF_DETECTED,
        message: 'El token de seguridad ya ha sido utilizado'
      }
    }

    this.usedNonces.set(nonce, now)

    return { valid: true }
  }

  /**
   * Limpia nonces expirados para mantener la memoria acotada.
   */
  private static cleanExpiredNonces(maxMinutes: number): void {
    const threshold = Date.now() - maxMinutes * 60 * 1000
    for (const [nonce, usedAt] of this.usedNonces.entries()) {
      if (usedAt < threshold) {
        this.usedNonces.delete(nonce)
      }
    }
  }

  /**
   * Utilidad para vaciar nonces en pruebas unitarias.
   */
  static clearUsedNonces(): void {
    this.usedNonces.clear()
  }
}
