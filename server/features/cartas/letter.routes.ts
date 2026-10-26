import express from 'express'
import { Validator } from 'req-valid-express'
import { LetterController } from './LetterController.js'
import sch from './letterSchemas.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { letterService } from '../../shared/dependencies.js'

export const letterController = new LetterController(letterService)
const letterRouter = express.Router()

letterRouter.get(
  '/admin',
  Validator.validateQuery(sch.adminQuery),
  letterController.getAllAdmin
)

letterRouter.get(
  '/admin/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  letterController.getById
)

letterRouter.patch(
  '/admin/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(sch.moderateLetter),
  letterController.moderateLetter
)

letterRouter.delete(
  '/admin/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  letterController.delete
)

export default letterRouter
