import express from 'express'
import { loggerServiceDb } from '../../configs/logger/LoggerServiceDb.js'
import { LoggerController } from '../../configs/logger/LoggerController.js'
import { Validator } from 'req-valid-express'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import logQuery from './logSchema.js'

const logger = new LoggerController(loggerServiceDb)

const logRouter = express.Router()

logRouter.get(
  '/',
  Validator.validateQuery(logQuery,{
    searchField: ['levelName', 'message', 'status'],
    sortBy: ['id', 'time', 'createdAt'],
    order:['ASC', 'DESC']
  }),
  logger.getAll
)

logRouter.get(
  '/:id', 
  Validator.paramId('id', UuidHandler.uuidRegex),
  logger.getById)

logRouter.patch(
  '/:id', 
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody({ keep:{ type:'boolean' } }),
  logger.update)

logRouter.delete(
  '/:id', 
  Validator.paramId('id', UuidHandler.uuidRegex),
  logger.delete)

logRouter.delete(
  '/:id/clean',
  Validator.paramId('id', UuidHandler.uuidRegex),
  logger.deleteAll)

export default logRouter