import session from 'supertest'
import app from '../../server/app.js'
import { userService } from '../../server/shared/dependencies.js'
import { UserRole } from '../../server/shared/auth/authMiddlewares.js'

export const mockUsers = {
  admin: {
    email: 'admin_integration@example.com',
    password: 'L1234567'
  },
  regular: {
    email: 'user_integration@example.com',
    password: 'L1234567'
  }
}

export function extractCsrfToken(res: any): string {
  const setCookie = res.get('Set-Cookie')
  if (!setCookie) return ''
  const cookieArr = Array.isArray(setCookie) ? setCookie : [setCookie]
  const csrfCookie = cookieArr.find((c: string) => c.includes('XSRF-TOKEN'))
  if (!csrfCookie) return ''
  const rawToken = csrfCookie.split('=')[1].split(';')[0]
  return decodeURIComponent(rawToken)
}

let usersSeeded = false

export async function seedIntegrationUsers(): Promise<void> {
  // 1. Crear usuario Admin
  try {
    const admin = await userService.registerUser(mockUsers.admin)
    await userService.upgradeUser(admin.id, { role: UserRole.ADMIN, enabled: true })
  } catch {
    // Si ya existe en la base de datos
  }

  // 2. Crear usuario regular
  try {
    const user = await userService.registerUser(mockUsers.regular)
    await userService.upgradeUser(user.id, { role: UserRole.USER, enabled: true })
  } catch {
    // Si ya existe en la base de datos
  }

  usersSeeded = true
}

export function resetSeedState(): void {
  usersSeeded = false
}

/**
 * Autentica un agent de supertest iniciando sesión como ADMIN.
 * Retorna el token CSRF activo para subsiguientes peticiones mutantes (POST/DELETE).
 */
export async function createAuthenticatedAdminAgent(): Promise<{
  agent: ReturnType<typeof session.agent>
  csrfToken: string
}> {
  if (!usersSeeded) {
    await seedIntegrationUsers()
  }

  const agent = session.agent(app)

  // 1. Obtener cookie de sesión y CSRF token inicial
  const initRes = await agent.get('/api/v1/user')
  let csrfToken = extractCsrfToken(initRes)

  // 2. Iniciar sesión como ADMIN
  const loginRes = await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', csrfToken)
    .send(mockUsers.admin)

  // 3. Extraer el token CSRF post-login
  const postLoginToken = extractCsrfToken(loginRes)
  if (postLoginToken) {
    csrfToken = postLoginToken
  }

  return { agent, csrfToken }
}

/**
 * Autentica un agent de supertest iniciando sesión como usuario regular (USER).
 */
export async function createAuthenticatedUserAgent(): Promise<{
  agent: ReturnType<typeof session.agent>
  csrfToken: string
}> {
  if (!usersSeeded) {
    await seedIntegrationUsers()
  }

  const agent = session.agent(app)

  const initRes = await agent.get('/api/v1/user')
  let csrfToken = extractCsrfToken(initRes)

  const loginRes = await agent
    .post('/api/v1/auth/login')
    .set('x-csrf-token', csrfToken)
    .send(mockUsers.regular)

  const postLoginToken = extractCsrfToken(loginRes)
  if (postLoginToken) {
    csrfToken = postLoginToken
  }

  return { agent, csrfToken }
}
