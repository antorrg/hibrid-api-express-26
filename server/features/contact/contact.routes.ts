import express from 'express'
import { Validator } from 'req-valid-express'
import { ContactController } from './ContactController.js'
import { honeypotResponder, verifyContactToken, verifyText } from './middlewares.js'
import { emailSchema } from './contactSchemas.js'

const contactRouter = express.Router()
contactRouter.post(
  '/',
  honeypotResponder,
  verifyContactToken,
  Validator.validateBody(emailSchema),
  verifyText,
  ContactController.sendContactEmail
)
export default contactRouter