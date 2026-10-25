import crypto from 'crypto'

function randomAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

function hash(str: string): string {
  return crypto.createHash('sha1')
    .update(str, 'ascii')
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export type OptTokens = {
  saltLength?: number
  secretLength?: number
}

export class CSRF {
  readonly #saltLength: number
  readonly #secretLength: number

  constructor(options: OptTokens = {}) {
    this.#saltLength = options.saltLength ?? 8
    this.#secretLength = options.secretLength ?? 18

    if (typeof this.#saltLength !== 'number' || this.#saltLength < 1) {
      throw new TypeError('saltLength must be a positive number')
    }
    if (typeof this.#secretLength !== 'number' || this.#secretLength < 1) {
      throw new TypeError('secretLength must be a positive number')
    }
  }

  create(secret: string): string {
    if (!secret) throw new TypeError('secret is required')
    return this.#tokenize(secret, randomAlphanumeric(this.#saltLength))
  }

  async secret(): Promise<string> {
    const buf = await crypto.randomBytes(this.#secretLength)
    return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }


  secretSync(): string {
    return crypto.randomBytes(this.#secretLength)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  verify(secret: string, token: string): boolean {
    if (!secret || !token) return false
    const index = token.indexOf('-')
    if (index === -1) return false
    const salt = token.slice(0, index)
    const expected = this.#tokenize(secret, salt)
    return safeCompare(token, expected)
  }

  #tokenize(secret: string, salt: string): string {
    return salt + '-' + hash(salt + '-' + secret)
  }
}