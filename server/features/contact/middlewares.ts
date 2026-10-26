import type { Request, Response, NextFunction } from 'express'
import { responder } from '../../shared/utils/responder.js'
import logger from '../../configs/logger.js'

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