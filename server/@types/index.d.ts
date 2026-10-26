import type { Session, SessionData } from 'express-session'
import type { SessionUser } from '../shared/auth/authMiddlewares.js'
import type { RateLimitInfo } from 'express-rate-limit'

declare module 'express-session' {
  interface SessionData {
    csrfSecret?: string
    user?: SessionUser
    [key: string]: unknown
  }
}


declare global {
  namespace Express {
    interface Request {
      session: Session & Partial<SessionData>
      rateLimit?: RateLimitInfo
    }
  }
}

export {}