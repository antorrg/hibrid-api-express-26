import type { Request, Response, NextFunction } from 'express'
import { responder } from '../../shared/utils/responder.js'
import logger from '../../configs/logger.js'
import { HMACToken } from '../../shared/auth/HMACToken.js'
import { middError, ERROR_CODE } from '../../configs/errors.js'

export const honeypotResponder = (req: Request, res:Response, next: NextFunction) => {
  const value = req.body.website
  const honeypotFilled =
  typeof value === 'string' && value.trim().length > 0
  if (honeypotFilled) {
    logger.warn(
      {
        event: 'honeypot_triggered',
        method: req.method,
        path: req.path, // Ruta sin query string
        ip: req.ip,
        email: req.body?.email,
        honeypotField: 'website'
      },
      'Solicitud sospechosa detectada'
    )
    return responder(res, 200, 'Mensaje de contacto enviado exitosamente')
  }
  next()
}

export const verifyContactToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = (
    req.body?._csrf ||
    req.body?.csrfToken ||
    req.headers['x-csrf-token'] ||
    req.headers['csrf-token']
  ) as string | undefined

  if (!token) {
    logger.warn(
      {
        event: 'contact_token_missing',
        method: req.method,
        path: req.path,
        ip: req.ip
      },
      'Token de seguridad ausente en envío de contacto'
    )
    return next(middError(ERROR_CODE.MISSING_TOKEN, 'verifyContactToken', { message: 'Token de seguridad requerido' }))
  }

  const result = HMACToken.verify(token)
  if (!result.valid) {
    logger.warn(
      {
        event: 'contact_token_rejected',
        method: req.method,
        path: req.path,
        ip: req.ip,
        code: result.code,
        message: result.message
      },
      'Token de contacto rechazado'
    )
    return next(
      middError(result.code || ERROR_CODE.CSRF_DETECTED, 'verifyContactToken', {
        message: result.message
      })
    )
  }

  next()
}

const validateEmail = (input:{ email:string, issue:string, message:string }):string| null => {
  const errors:string[] = []
  if (!input.email) errors.push('Email es requerido')
  else if (!/\S+@\S+\.\S+/.test(input.email)) errors.push('Email es invalido') 
  if (!input.issue) errors.push('Asunto es requerido') 
  if (!input.message) errors.push('Mensaje es requerido')  
  if (input.message.includes('<script>')) errors.push('Mensaje es invalido')  
  if (input.message.length < 20) errors.push('Mensaje es muy corto')
  if (input.message.length > 1000) errors.push('Mensaje es muy largo') 
  return errors.length > 0? errors.join(', ') : null
}

export const verifyText = (req: Request, res: Response, next: NextFunction): void => {
  const { email, issue, message } = req.body
  const invalidEmail = validateEmail({ email, issue, message })
  if(invalidEmail !== null){
    return next(middError(ERROR_CODE.INVALID_INPUT, invalidEmail))
  }
  next()
}
