import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import app from '../../app.js'
import { HMACToken } from '../../shared/auth/HMACToken.js'

describe('Contact Route with HMACToken Protection', () => {
  beforeEach(() => {
    HMACToken.clearUsedNonces()
  })

  it('should reject request when token is missing', async() => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        email: 'test@example.com',
        subject: 'Consulta',
        message: 'Hola mundo'
      })

    expect(res.status).toBe(401)
  })

  it('should reject request with invalid or tampered token', async() => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        email: 'test@example.com',
        subject: 'Consulta',
        message: 'Hola mundo',
        _csrf: 'fake.token.signature'
      })

    expect(res.status).toBe(403)
  })

  it('should accept request with a valid token in body', async() => {
    const token = HMACToken.create()

    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        email: 'test@example.com',
        subject: 'Consulta',
        message: 'Hola mundo',
        _csrf: token
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
  })

  it('should accept request with a valid token in header x-csrf-token', async() => {
    const token = HMACToken.create()

    const res = await request(app)
      .post('/api/v1/contact')
      .set('x-csrf-token', token)
      .send({
        email: 'test@example.com',
        subject: 'Consulta',
        message: 'Hola mundo'
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message')
  })
})
