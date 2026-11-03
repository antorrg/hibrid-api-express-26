import express from 'express'
import { Validator } from 'req-valid-express'
import { AboutController } from './AboutController.js'
import { aboutService } from '../../shared/dependencies.js'
import { authorizeMinRole, UserRole } from '../../shared/auth/authMiddlewares.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { sanitizeRichText } from '../../shared/middlewares/sanitizeRichText.js'
import * as sch from './about.schema.js'

const controller = new AboutController(aboutService)
const aboutRouter = express.Router()

aboutRouter.get('/', controller.get)
aboutRouter.post(
  '/', 
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateBody(sch.createAbout),
  sanitizeRichText(['text']),
  controller.create
)
aboutRouter.put(
  '/:id', 
  Validator.paramId('id', UuidHandler.uuidRegex),
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateBody(sch.updateAbout),
  sanitizeRichText(['text']),
  controller.update
)

export default aboutRouter
