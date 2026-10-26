import { rateLimit, type Options } from 'express-rate-limit'
import { middError, ERROR_CODE } from '../../configs/errors.js'

type RateLimitConfig = Pick<Options, 'windowMs' | 'limit'> & {
  message?: string | { message?: string; [key: string]: unknown }
}

export function createRateLimiter({
  windowMs,
  limit,
  message
}: RateLimitConfig) {
  const resolvedMessage = typeof message === 'string'
    ? message
    : (typeof message === 'object' && message !== null && typeof message.message === 'string')
      ? message.message
      : 'Demasiadas solicitudes. Intenta más tarde'

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, _res, next) => {
      next(
        middError(ERROR_CODE.RATE_LIMIT_EXCEEDED, 'createRateLimiter', {
          message: resolvedMessage,
          details: {
            ip: req.ip,
            endpoint: req.originalUrl,
            used: req.rateLimit?.used,
            limit: req.rateLimit?.limit,
            resetTime: req.rateLimit?.resetTime
          }
        })
      )
    }
  })
}