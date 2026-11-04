import express from 'express'
import { Validator } from 'req-valid-express'
import { createRateLimiter } from '../../shared/utils/createRateLimiter.js'
import { apiMiddleware } from '../apiKey/apiKey.routes.js'
import sch from './letterSchemas.js'
import { letterController } from './letter.routes.js'
import envConfig from '../../configs/envConfig.js'

const skipRateLimitInTest = envConfig.Status === 'test'? true :false

const letterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5,
  skip: () => skipRateLimitInTest
})
const readLetterLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  limit: 60,
  skip: () => skipRateLimitInTest
})
const publicLetterRouter = express.Router()

publicLetterRouter.post(
  '/',
  letterLimiter,
  apiMiddleware.verifyApiKey,
  Validator.validateBody(sch.createLetter),
  letterController.create
)

publicLetterRouter.get(
  '/',
  readLetterLimiter,
  Validator.validateQuery(sch.publicQuery),
  letterController.getAll
)

export default publicLetterRouter
