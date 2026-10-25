import type { Request, Response, NextFunction } from 'express'
import { emailService } from '../../shared/externals/EmailService/EmailService.js'
import { ERROR_CODE, middError } from '../../configs/errors.js'
import { responder } from '../../shared/utils/responder.js'
import envConfig from '../../configs/envConfig.js'
import logger from '../../configs/logger.js'



export class ContactController {

  static sendContactEmail = async(req: Request, res: Response, next: NextFunction) => {
    if (envConfig.Status === 'test') {
      return responder(res, 200, { message: 'Mock enviado exitosamente (TEST_ENV)' })
    }
        
    try {
      const { email, issue, message } = req.body
            
      // Forward contact messages securely to the admin's inbox
      const adminEmail = envConfig.GmailUser
      const subject = `Nuevo mensaje de contacto de: ${email}`
      const text = `Remitente: antorrg-software-webSite (${email})\n\nAsunto: ${issue}\n\n${message}`
      const replyTo= email

      await emailService.sendRawEmail({
        to: adminEmail!,
        subject,
        text,
        replyTo
      })
      logger.info('Email enviado exitosamente:'+email)
      res.status(200).json({ message: 'Mensaje de contacto enviado exitosamente' })
    } catch (error) {
      console.error(error)
      return next(middError(ERROR_CODE.OPERATION_FAILED, 'Ocurrio un error, mensaje no enviado'))
    }
  }
}
