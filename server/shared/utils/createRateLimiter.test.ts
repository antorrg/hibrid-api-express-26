import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { type Request, type Response } from 'express'
import request from 'supertest'
import { createRateLimiter } from './createRateLimiter.js'
import { errorHandler, AppError } from '../../configs/errors/errorHandlers.js'
import logger from '../../configs/logger.js'

vi.mock('../../configs/logger.js', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('permite peticiones dentro del límite', async() => {
    const app = express()
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      limit: 2
    })

    app.get('/test', limiter, (_req: Request, res: Response) => {
      res.json({ ok: true })
    })
    app.use(errorHandler)

    const res1 = await request(app).get('/test')
    expect(res1.status).toBe(200)
    expect(res1.body).toEqual({ ok: true })

    const res2 = await request(app).get('/test')
    expect(res2.status).toBe(200)
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('delega el error a errorHandler y logger cuando se excede el límite', async() => {
    const app = express()
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      limit: 1
    })

    app.get('/test', limiter, (_req: Request, res: Response) => {
      res.json({ ok: true })
    })
    app.use(errorHandler)

    const res1 = await request(app).get('/test')
    expect(res1.status).toBe(200)

    const res2 = await request(app).get('/test')
    expect(res2.status).toBe(429)
    expect(res2.body.ok).toBe(false)
    expect(res2.body.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(res2.body.message).toBe('Demasiadas solicitudes. Intenta más tarde')
    expect(res2.body.details).toMatchObject({
      used: 2,
      limit: 1
    })

    // Verifica que logger.error haya sido llamado
    expect(logger.error).toHaveBeenCalledTimes(1)
    const loggedError = (logger.error as any).mock.calls[0][0]
    expect(loggedError).toBeInstanceOf(AppError)
    expect(loggedError.code).toBe('RATE_LIMIT_EXCEEDED')
    expect(loggedError.contexts).toContain('Middleware error in [createRateLimiter]:')

    // Verifica encabezados estándar de draft-8 y retry-after
    expect(res2.headers['ratelimit']).toBeDefined()
    expect(res2.headers['ratelimit-policy']).toBeDefined()
    expect(res2.headers['retry-after']).toBeDefined()
  })

  it('permite personalizar el mensaje de error', async() => {
    const app = express()
    const limiter = createRateLimiter({
      windowMs: 60 * 1000,
      limit: 1,
      message: 'Límite de envíos alcanzado'
    })

    app.get('/custom', limiter, (_req: Request, res: Response) => {
      res.json({ ok: true })
    })
    app.use(errorHandler)

    await request(app).get('/custom')
    const res2 = await request(app).get('/custom')

    expect(res2.status).toBe(429)
    expect(res2.body.message).toBe('Límite de envíos alcanzado')
    expect(logger.error).toHaveBeenCalledTimes(1)
  })
})
