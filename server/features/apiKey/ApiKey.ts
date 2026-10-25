import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import {
  createHash,
  randomBytes,
  timingSafeEqual
} from 'node:crypto'
import type { ApiKeyPersistenceData } from './ApiKey.types.js'

export interface GeneratedApiKey {
  toClient: string
  toPersistence: ApiKeyPersistenceData
}

export interface ParsedApiKey {
  keyId: string
  secret: string
}

export class ApiKey {
  static createApiKey(clientId: string): GeneratedApiKey {
    const keyId = randomBytes(6).toString('hex')
    const secret = randomBytes(32).toString('base64url')

    const keyHash = createHash('sha256')
      .update(secret)
      .digest('hex')

    const apiKey = `hbx_${keyId}_${secret}`
    return {
      toClient: apiKey,
      toPersistence: {
        id: UuidHandler.createUuid(),
        clientId,
        keyId,
        keyHash
      }
    }
  }

  static parse(apiKey: unknown): ParsedApiKey | null {
    if (typeof apiKey !== 'string') {
      return null
    }

    const match = apiKey.match(/^hbx_([a-f0-9]{12})_(.+)$/)
    if (!match) {
      return null
    }

    const [, keyId, secret] = match
    return { keyId, secret }
  }

  static verify(secret: unknown, storedHash: unknown): boolean {
    if (
      typeof secret !== 'string' ||
      typeof storedHash !== 'string'
    ) {
      return false
    }

    const incomingHash = createHash('sha256')
      .update(secret)
      .digest()

    const expectedHash = Buffer.from(storedHash, 'hex')

    if (incomingHash.length !== expectedHash.length) {
      return false
    }

    return timingSafeEqual(incomingHash, expectedHash)
  }
}
