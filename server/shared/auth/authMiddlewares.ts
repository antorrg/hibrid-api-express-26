import { type Request, type Response, type NextFunction } from 'express'
import { middError, ERROR_CODE } from '../../configs/errors.js'
import { CSRF } from './CSRF.js'
import envConfig from '../../configs/envConfig.js'

const csrfTokens = new CSRF({ saltLength: 8, secretLength: 18 })

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER'
}
export interface SessionUser {
  id: string
  email: string
  role: UserRole
}
export const RoleHierarchy: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.OWNER]: 3
}

// Genera el secreto en sesión (si no existe) y escribe el token en la cookie XSRF-TOKEN.
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Inicializar el secreto en sesión la primera vez
  if (!req.session.csrfSecret) {
    req.session.csrfSecret = csrfTokens.secretSync()
    req.session.save((err) => {
      if (err) return next(middError(ERROR_CODE.CSRF_DETECTED, 'csrfProtection', { message: 'The session could not be initialized' }))
      next()
    })
    return
  }
  next()
}

// Expone el token CSRF en la cookie XSRF-TOKEN (legible por JS del cliente, sin httpOnly).
export const setCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  const secret = req.session.csrfSecret!
  const token = csrfTokens.create(secret)
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // debe ser legible por el cliente
    secure: envConfig.Status === 'production',
    sameSite: 'lax'
  })
  next()
}

// Verifica el token CSRF en métodos mutantes (POST, PUT, PATCH, DELETE).
// Lee el token desde header 'x-csrf-token', 'csrf-token' o body '_csrf'.
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const secret = req.session.csrfSecret
  if (!secret) {
    return next(middError(ERROR_CODE.CSRF_DETECTED, 'verifyCsrfToken', { message: 'CSRF: session without secret' }))
  }

  const token =
    (req.headers['x-csrf-token'] as string) ||
    (req.headers['csrf-token'] as string) ||
    (req.body?._csrf as string)

  if (!csrfTokens.verify(secret, token)) {
    return next(middError(ERROR_CODE.CSRF_DETECTED, 'verifyCsrfToken', { message: 'Invalid CSRF token' }))
  }

  next()
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const sessionUser = req.session.user
  if (!sessionUser) return next(middError(ERROR_CODE.UNAUTHORIZED, 'isAuthenticated', { message: 'Unauthenticated' }))
  next()
}

// RBAC
export const authorize =
  (...allowedRoles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      const user = req.session.user
      if (!user) return next(middError(ERROR_CODE.UNAUTHORIZED, 'authorize', { message: 'No autenticado' }))

      if (!allowedRoles.includes(user.role)) {
        return next(middError(ERROR_CODE.FORBIDDEN, 'authorize', { message: 'Accion no permitida' }))
      }

      next()
    }

export const authorizeMinRole =
  (minimumRole: UserRole) =>
    (req: Request, res: Response, next: NextFunction) => {
      const sessionUser = req.session.user

      if (!sessionUser) {
        return next(middError(ERROR_CODE.UNAUTHORIZED, 'authorizeMinRole', { message: 'No autenticado' }))
      }

      const userLevel = RoleHierarchy[sessionUser.role as UserRole]
      const requiredLevel = RoleHierarchy[minimumRole]

      if (userLevel < requiredLevel) {
        return next(middError(ERROR_CODE.ROLE_NOT_ALLOWED, 'authorizeMinRole', { message: 'Faltan permisos para esta accion' }))
      }

      next()
    }

export class Auth {
  static login(req: Request, user: { id: string, email: string, role: UserRole }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!req.session) {
        return reject(middError(ERROR_CODE.UNEXPECTED_ERROR, 'Auth.login', { message: 'Session middleware is not initialized' }))
      }
      const existingCsrfSecret = req.session.csrfSecret ?? csrfTokens.secretSync()
      req.session.regenerate((err) => {
        if (err) return reject(err)
        req.session.user = user
        req.session.csrfSecret = existingCsrfSecret
        req.session.save((saveErr) => {
          if (saveErr) return reject(saveErr)
          resolve()
        })
      })
    })
  }

  static logout(req: Request): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!req.session) {
        return resolve()
      }
      req.session.destroy((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  static getSessionUser(req: Request) {
    return req.session?.user ?? null
  }
}
