import express from 'express'
import { Validator } from 'req-valid-express'
import { createRateLimiter } from '../../shared/utils/createRateLimiter.js'
import { apiMiddleware } from '../apiKey/apiKey.routes.js'
import sch from './letterSchemas.js'
import { letterController } from './letter.routes.js'

const letterLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  limit: 5
})
const publicLetterRouter = express.Router()

publicLetterRouter.post(
  '/',
  apiMiddleware.verifyApiKey,
  letterLimiter,
  Validator.validateBody(sch.createLetter),
  letterController.create
)

publicLetterRouter.get(
  '/',
  //apiMiddleware.verifyApiKey,
  letterLimiter,
  Validator.validateQuery(sch.publicQuery),
  letterController.getAll
)

export default publicLetterRouter
