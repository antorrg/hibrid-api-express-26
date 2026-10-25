import session from 'supertest'
import { describe, it, beforeAll, expect } from 'vitest'
import serverTest from './testHelpers/serverTest.help.js'
import { UserRole } from './authMiddlewares.js'

const agent = session.agent(serverTest)

const getCsrf = (res: any) => {
  const setCookie = res.get('Set-Cookie')
  if (!setCookie) return ''
  const csrfCookie = setCookie.find((c: string) => c.includes('XSRF-TOKEN'))
  return csrfCookie ? csrfCookie.split('=')[1].split(';')[0] : ''
}

describe('Session & CSRF Auth tests', () => {
  let csrfToken: string
  // let cookie: string // This variable is no longer needed

  beforeAll(async() => {
    // Get initial CSRF token and session cookie
    const response = await agent.get('/csrf')
    // const setCookie = response.get('Set-Cookie') // Replaced by getCsrf
    // if (setCookie) {
    //   cookie = setCookie.join('; ') // This is no longer needed
    //   const csrfCookie = setCookie.find(c => c.includes('XSRF-TOKEN'))
    //   csrfToken = csrfCookie?.split('=')[1].split(';')[0] || ''
    // }
    csrfToken = getCsrf(response)
  })

  it('should deny access if not authenticated', async() => {
    const res = await agent.get('/protected')
    expect(res.status).toBe(401)
    // The error handler might only return a message or a different structure
  })

  it('should login successfully and set session', async() => {
    const user = { id: '123', email: 'test@test.com', role: UserRole.USER }
    const res = await agent
      .post('/login')
      .set('x-csrf-token', decodeURIComponent(csrfToken))
      .send({ user })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should allow access to protected route after login', async() => {
    const res = await agent.get('/protected')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.user.email).toBe('test@test.com')
    console.log(res.body.user)
  })

  it('should deny access to admin route for normal user', async() => {
    const res = await agent.get('/admin')
    expect(res.status).toBe(403)
  })

  it('should allow access to admin route after admin login', async() => {
    const admin = { id: '456', email: 'admin@test.com', role: UserRole.ADMIN }

    // We need a fresh agent to clear the previous session or logout
    const adminAgent = session.agent(serverTest)
    // const init = await adminAgent.get('/protected') // Changed to /csrf to get a fresh token
    // const adminCsrf = init.get('Set-Cookie').find(c => c.includes('XSRF-TOKEN'))?.split('=')[1].split(';')[0] || '' // Replaced by getCsrf
    const init = await adminAgent.get('/csrf')
    const adminCsrf = getCsrf(init)

    await adminAgent
      .post('/login')
      .set('x-csrf-token', decodeURIComponent(adminCsrf))
      .send({ user: admin })

    const res = await adminAgent.get('/admin')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('should logout successfully', async() => {
    const res = await agent
      .post('/logout')
      .set('x-csrf-token', decodeURIComponent(csrfToken))

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const protectedRes = await agent.get('/protected')
    expect(protectedRes.status).toBe(401)  })
})