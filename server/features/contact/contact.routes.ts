import express from 'express'
import { Validator } from 'req-valid-express'
import { ContactController } from './ContactController.js'
import { honeypotResponder, verifyContactToken, verifyText } from './middlewares.js'
import { emailSchema } from './contactSchemas.js'
import { createRateLimiter } from '../../shared/utils/createRateLimiter.js'
import envConfig from '../../configs/envConfig.js'

const skipRateLimitInTest = envConfig.Status === 'test'? true :false
const contactIpPerMinuteLimite = createRateLimiter({
  windowMs: 60* 1000,
  limit: 1,
  skip: () => skipRateLimitInTest  
})
const contactIpPerHourLimiter = createRateLimiter({
  windowMs: 60 * 60* 1000,
  limit: 5,
  skip: () => skipRateLimitInTest 
})

const contactRouter = express.Router()
contactRouter.post(
  '/',
  contactIpPerMinuteLimite,
  contactIpPerHourLimiter,
  honeypotResponder,
  verifyContactToken,
  Validator.validateBody(emailSchema),
  verifyText,
  ContactController.sendContactEmail
)
export default contactRouter