import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HMACToken } from './HMACToken.js'
import { ERROR_CODE } from '../../configs/errors/errorCodes.js'

describe('HMACToken', () => {
  beforeEach(() => {
    HMACToken.clearUsedNonces()
  })

  it('should generate a token with 3 dot-separated parts', () => {
    const token = HMACToken.create()
    const parts = token.split('.')
    expect(parts).toHaveLength(3)
    expect(parts[0]).toBeDefined() // nonce
    expect(Number(parts[1])).toBeGreaterThan(0) // timestamp
    expect(parts[2]).toBeDefined() // signature
  })

  it('should verify a newly created token successfully', () => {
    const token = HMACToken.create()
    const result = HMACToken.verify(token, { minSeconds: 0 })
    expect(result.valid).toBe(true)
  })

  it('should reject if token is missing or undefined', () => {
    const result = HMACToken.verify(undefined as any)
    expect(result.valid).toBe(false)
    expect(result.code).toBe(ERROR_CODE.MISSING_TOKEN)
  })

  it('should reject malformed token strings', () => {
    const result = HMACToken.verify('invalid.token')
    expect(result.valid).toBe(false)
    expect(result.code).toBe(ERROR_CODE.INVALID_TOKEN)
  })

  it('should reject tampered token signatures', () => {
    const token = HMACToken.create()
    const [nonce, ts, sig] = token.split('.')
    const tampered = `${nonce}.${ts}.${sig.slice(0, -4)}abcd`

    const result = HMACToken.verify(tampered, { minSeconds: 0 })
    expect(result.valid).toBe(false)
    expect(result.code).toBe(ERROR_CODE.CSRF_DETECTED)
  })

  it('should reject submission if sent faster than minSeconds (anti-bot trap)', () => {
    const token = HMACToken.create()
    // Explicitly demand at least 5 seconds between creation and verification
    const result = HMACToken.verify(token, { minSeconds: 5 })
    expect(result.valid).toBe(false)
    expect(result.code).toBe(ERROR_CODE.SUSPICIOUS_ACTIVITY)
    expect(result.message).toContain('rápido')
  })

  it('should reject token if expired (older than maxMinutes)', () => {
    // Mock Date.now to generate a token 20 minutes in the past
    const originalNow = Date.now()
    const pastTime = originalNow - (20 * 60 * 1000)

    const dateSpy = vi.spyOn(Date, 'now')
    dateSpy.mockReturnValue(pastTime)
    const token = HMACToken.create()

    // Restore current time
    dateSpy.mockReturnValue(originalNow)

    const result = HMACToken.verify(token, { maxMinutes: 15, minSeconds: 0 })
    expect(result.valid).toBe(false)
    expect(result.code).toBe(ERROR_CODE.EXPIRED_TOKEN)

    dateSpy.mockRestore()
  })

  it('should reject reused tokens (One-Time Token protection)', () => {
    const token = HMACToken.create()

    // First use: ok
    const firstAttempt = HMACToken.verify(token, { minSeconds: 0 })
    expect(firstAttempt.valid).toBe(true)

    // Second use with same token: rejected
    const secondAttempt = HMACToken.verify(token, { minSeconds: 0 })
    expect(secondAttempt.valid).toBe(false)
    expect(secondAttempt.code).toBe(ERROR_CODE.CSRF_DETECTED)
    expect(secondAttempt.message).toContain('ya ha sido utilizado')
  })
})
