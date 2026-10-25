import express from 'express'
import { Validator } from 'req-valid-express'
import { LetterController } from './LetterController.js'
import { isAuthenticated, authorizeMinRole, UserRole } from '../../shared/auth/authMiddlewares.js'
import { apiMiddleware } from '../apiKey/apiKey.routes.js'
import sch from './letterSchemas.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { letterService } from '../../shared/dependencies.js'

const cont = new LetterController(letterService)
const letterRouter = express.Router()

letterRouter.post(
  '/',
  apiMiddleware.verifyApiKey,
  Validator.validateBody(sch.createLetter),
  cont.create
)

letterRouter.get(
  '/',
  apiMiddleware.verifyApiKey,
  Validator.validateQuery(sch.publicQuery),
  cont.getAll
)

letterRouter.get(
  '/admin',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateQuery(sch.adminQuery),
  cont.getAllAdmin
)

letterRouter.get(
  '/admin/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  cont.getById
)

letterRouter.patch(
  '/admin/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(sch.moderateLetter),
  cont.moderateLetter
)

letterRouter.delete(
  '/admin/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  cont.delete
)

export default letterRouter
