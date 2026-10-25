import express from 'express'
import { Validator } from 'req-valid-express'
import { apiKeyService, apiMiddleware } from '../../shared/dependencies.js'
import { ApiKeyController } from './ApiKeyController.js'
import sch from './apiKeySchemas.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'

export { apiMiddleware }

const cont = new ApiKeyController(apiKeyService)
const apiKeyRouter = express.Router()

apiKeyRouter.post(
  '/',
  Validator.validateBody(sch.create),
  cont.register
)

apiKeyRouter.get(
  '/',
  Validator.validateQuery(sch.query),
  cont.getAll
)

apiKeyRouter.get(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  cont.getClientById
)

apiKeyRouter.put(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(sch.updateClient),
  cont.clientUpdater
)

apiKeyRouter.patch(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(sch.updateKey),
  cont.apiEnableDisable
)

apiKeyRouter.delete(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  cont.clientDeleter
)

apiKeyRouter.delete(
  '/:id/apiKey',
  Validator.paramId('id', UuidHandler.uuidRegex),
  cont.apiKeyDeleter
)

export default apiKeyRouter
