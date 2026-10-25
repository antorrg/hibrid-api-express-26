import { describe, it, expect } from 'vitest'
import { ApiKey } from './ApiKey.js'

describe('ApiKey entity', () => {
  it('should generate a valid api key and persistence payload', () => {
    const clientId = 'client-123'
    const result = ApiKey.createApiKey(clientId)

    expect(result.toClient).toMatch(/^hbx_[a-f0-9]{12}_[A-Za-z0-9_-]+$/)
    expect(result.toPersistence.clientId).toBe(clientId)
    expect(result.toPersistence.keyId).toHaveLength(12)
    expect(result.toPersistence.keyHash).toHaveLength(64)
  })

  it('should parse a valid api key', () => {
    const key = 'hbx_123456abcdef_secretPart123'
    const parsed = ApiKey.parse(key)

    expect(parsed).toEqual({
      keyId: '123456abcdef',
      secret: 'secretPart123'
    })
  })

  it('should return null when parsing invalid api key', () => {
    expect(ApiKey.parse('')).toBeNull()
    expect(ApiKey.parse('invalid_key')).toBeNull()
    expect(ApiKey.parse(123 as unknown as string)).toBeNull()
    expect(ApiKey.parse('hbx_short_secret')).toBeNull()
  })

  it('should verify secret against valid hash', () => {
    const { toClient, toPersistence } = ApiKey.createApiKey('client-abc')
    const parsed = ApiKey.parse(toClient)!

    const isValid = ApiKey.verify(parsed.secret, toPersistence.keyHash)
    expect(isValid).toBe(true)

    const isInvalid = ApiKey.verify('wrong_secret', toPersistence.keyHash)
    expect(isInvalid).toBe(false)
  })
})
