import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type Request, type Response, type NextFunction } from 'express'
import * as eh from './errorHandlers.js'
import logger from '../logger.js'
const AppError = eh.AppError

// Mock logger to avoid polluting test output
vi.mock('../logger.js', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}))

describe('Error Handlers', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AppError instances', () => {
    it('Creates an instance with code and message', () => {
      const error = new AppError('RESOURCE_NOT_FOUND')
      expect(error.code).toBe('RESOURCE_NOT_FOUND')
      expect(error.message).toBe('RESOURCE_NOT_FOUND')
      expect(error.contexts).toEqual([])
    })

    it('Respects custom message and details', () => {
      const error = new AppError('RESOURCE_NOT_FOUND', { message: 'Custom message', details: { id: 123 } })
      expect(error.message).toBe('Custom message')
      expect(error.details).toEqual({ id: 123 })
    })

    it('Respects contextual data', () => {
      const error = new AppError('RESOURCE_NOT_FOUND', { contexts: ['UserService'] })
      expect(error.contexts).toEqual(['UserService'])
    })
  })

  describe('throwError', () => {
    it('throws an AppError', () => {
      expect(() => eh.throwError('UNKNOWN_ERROR')).toThrow(AppError)
      try {
        eh.throwError('RESOURCE_NOT_FOUND', { contexts: ['Repo'] })
      } catch (error: any) {
        expect(error.code).toBe('RESOURCE_NOT_FOUND')
        expect(error.contexts).toEqual(['Repo'])
      }
    })

    it('supports passing message directly as second argument', () => {
      try {
        eh.throwError('INVALID_INPUT', 'Field email is invalid')
      } catch (error: any) {
        expect(error.code).toBe('INVALID_INPUT')
        expect(error.message).toBe('Field email is invalid')
      }
    })
  })

  describe('processError', () => {
    it('should append context to an existing AppError', () => {
      const existingError = new AppError('RESOURCE_NOT_FOUND')
      try {
        eh.processError(existingError, 'UserService')
      } catch (err: any) {
        expect(err.contexts).toEqual(['UserService'])
      }
    })

    it('should not append duplicate context if already ends with it', () => {
      const existingError = new AppError('RESOURCE_NOT_FOUND', { contexts: ['UserService'] })
      try {
        eh.processError(existingError, 'UserService')
      } catch (err: any) {
        expect(err.contexts).toEqual(['UserService'])
      }
    })

    it('should convert an Error to AppError with UNEXPECTED_ERROR code and store in details', () => {
      const stdError = new Error('Database down')
      try {
        eh.processError(stdError, 'DatabaseLayer')
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError)
        expect(err.code).toBe('UNEXPECTED_ERROR')
        expect(err.contexts).toEqual(['DatabaseLayer'])
        expect(err.details).toBe(stdError)
      }
    })

    it('should convert an unknown literal to AppError with UNKNOWN_THROWN_VALUE', () => {
      try {
        eh.processError('some weird string error', 'UnknownLayer')
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError)
        expect(err.code).toBe('UNKNOWN_THROWN_VALUE')
        expect(err.contexts).toEqual(['UnknownLayer'])
        expect(err.details).toBe('some weird string error')
      }
    })
  })

  describe('Express middlewares', () => {
    let req: Partial<Request>
    let res: Partial<Response>
    let next: NextFunction

    beforeEach(() => {
      req = {}
      res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      }
      next = vi.fn()
    })
    describe('middError', () => {
      it('returns an AppError with Middleware error context', () => {
        const err = eh.middError('MISSING_TOKEN')
        expect(err).toBeInstanceOf(AppError)
        expect(err.code).toBe('MISSING_TOKEN')
        expect(err.contexts).toEqual(['Middleware error:'])
      })

      it('returns an AppError with specific middleware name', () => {
        const err = eh.middError('MISSING_TOKEN', 'AuthMiddleware', { contexts: ['Additional'] })
        expect(err.contexts).toEqual(['Middleware error in [AuthMiddleware]:', 'Additional'])
      })

      it('returns an AppError appending provided context', () => {
        const err = eh.middError('MISSING_TOKEN', undefined, { contexts: ['AuthService'] })
        expect(err.contexts).toEqual(['Middleware error:', 'AuthService'])
      })
    })

    describe('errorHandler', () => {
      it('handles AppError properly and uses logger.error', () => {
        const error = new AppError('RESOURCE_NOT_FOUND')
        eh.errorHandler(error, req as Request, res as Response, next)

        expect(logger.error).toHaveBeenCalledWith(error)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
          ok: false,
          code: 'RESOURCE_NOT_FOUND',
          message: 'RESOURCE_NOT_FOUND'
        })
      })

      it('normalizes standard errors to UNEXPECTED_ERROR AppError and logs them', () => {
        const standardError = new Error('Syntax error during parsing')
        eh.errorHandler(standardError, req as Request, res as Response, next)

        expect(logger.error).toHaveBeenCalledTimes(1)
        const loggedError = (logger.error as any).mock.calls[0][0]
        expect(loggedError).toBeInstanceOf(AppError)
        expect(loggedError.code).toBe('UNEXPECTED_ERROR')
        expect(loggedError.cause).toBe(standardError)
        expect(res.status).toHaveBeenCalledWith(500)
        // el Error original queda en `cause` para logs, nunca en la respuesta al cliente
        expect(res.json).toHaveBeenCalledWith({
          ok: false,
          code: 'UNEXPECTED_ERROR',
          message: 'Syntax error during parsing'
        })
      })

      it('normalizes string error code to correct numeric status', () => {
        eh.errorHandler('RESOURCE_NOT_FOUND', req as Request, res as Response, next)
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({
          ok: false,
          code: 'RESOURCE_NOT_FOUND',
          message: 'RESOURCE_NOT_FOUND'
        })
      })

      it('normalizes object with code property to correct numeric status, without leaking the raw object', () => {
        eh.errorHandler({ code: 'UNAUTHORIZED' }, req as Request, res as Response, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
          ok: false,
          code: 'UNAUTHORIZED',
          message: 'UNAUTHORIZED'
        })
      })

      it('exposes only the explicit details field when the source object provides one', () => {
        eh.errorHandler({ code: 'UNAUTHORIZED', message: 'Token expired', details: { reason: 'expired' } }, req as Request, res as Response, next)
        expect(res.json).toHaveBeenCalledWith({
          ok: false,
          code: 'UNAUTHORIZED',
          message: 'Token expired',
          details: { reason: 'expired' }
        })
      })
    })

    describe('jsonFormat', () => {
      it('returns middError(INVALID_JSON) for body SyntaxError with status 400', () => {
        const err = new SyntaxError('Unexpected token') as Error & { status?: number, body?: string }
        err.status = 400
        err.body = '{ bad json }'

        eh.jsonFormat(err, req as Request, res as Response, next)

        expect(next).toHaveBeenCalledTimes(1)
        const nextArg = (next as any).mock.calls[0][0]
        expect(nextArg).toBeInstanceOf(AppError)
        expect(nextArg.code).toBe('INVALID_JSON')
      })

      it('passes error to next() if not a 400 body SyntaxError', () => {
        const err = new Error('Normal error')
        eh.jsonFormat(err as Error, req as Request, res as Response, next)
        expect(next).toHaveBeenCalledWith(err)
      })
    })

    describe('notFoundRoute', () => {
      it('calls next() with ROUTE_NOT_FOUND', () => {
        eh.notFoundRoute(req as Request, res as Response, next)
        expect(next).toHaveBeenCalledTimes(1)
        const nextArg = (next as any).mock.calls[0][0]
        expect(nextArg).toBeInstanceOf(AppError)
        expect(nextArg.code).toBe('ROUTE_NOT_FOUND')
      })
    })

  })  
  
})
  