import express from 'express'
import cookieParser from 'cookie-parser'
import * as eh from '../../server/configs/errors.js'
import { sessionMiddleware } from '../../server/shared/auth/session.js'
import {
  csrfProtection,
  setCsrfToken,
  verifyCsrfToken,
  isAuthenticated,
  authorize,
  authorizeMinRole,
  UserRole,
  Auth
} from '../../server/shared/auth/authMiddlewares.js'
import { userService } from '../../server/shared/dependencies.js'
import authRouter from '../../server/features/auth/auth.routes.js'

const serverAuth = express()
serverAuth.use(express.json())
serverAuth.use(cookieParser())
serverAuth.use(sessionMiddleware)

// CSRF Middlewares
serverAuth.use(csrfProtection)
serverAuth.use(setCsrfToken)
serverAuth.use(verifyCsrfToken)

// Helper endpoint for CSRF token initialization
serverAuth.get('/test/csrf', (req, res) => {
  res.status(200).json({ ok: true, message: 'CSRF token initialized' })
})

// Main Auth Routes (/test/login, /test/logout, /test/me)
serverAuth.use('/test', authRouter)

// Aux routes to test permissions & RBAC
serverAuth.get('/test/protected', isAuthenticated, (req, res) => {
  res.status(200).json({ ok: true, message: 'Passed isAuthenticated', user: Auth.getSessionUser(req) })
})


serverAuth.get('/test/admin-only', authorize(UserRole.ADMIN), (req, res) => {
  res.status(200).json({ ok: true, message: 'Passed authorize ADMIN' })
})

serverAuth.get('/test/min-admin', authorizeMinRole(UserRole.ADMIN), (req, res) => {
  res.status(200).json({ ok: true, message: 'Passed authorizeMinRole ADMIN' })
})

serverAuth.use(eh.errorHandler)
export default serverAuth

export const mockUser = { email: 'usertest@gmail.com', password: 'L1234567' }
export const mockAdmin = { email: 'admintest@gmail.com', password: 'L1234567' }
export const mockDisabled = { email: 'disabledtest@gmail.com', password: 'L1234567' }


let userId: string
let adminId: string
let disabledId: string

export async function testUsersSeed() {
  const userCreated = await userService.registerUser(mockUser)
  userId = userCreated.id

  const adminCreated = await userService.registerUser(mockAdmin)
  adminId = adminCreated.id
  await userService.upgradeUser(adminId, { role: 'ADMIN', enabled: true })

  const disabledCreated = await userService.registerUser(mockDisabled)
  disabledId = disabledCreated.id
  await userService.upgradeUser(disabledId, { role: 'USER', enabled: false })
}

export const getUserid = (): string => userId
export const getAdminid = (): string => adminId
export const getDisabledid = (): string => disabledId