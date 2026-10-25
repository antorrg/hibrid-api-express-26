import express from 'express'
import { UserController } from './UserController.js'
import { userService } from '../../shared/dependencies.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { Validator } from 'req-valid-express'
import * as sch from './userSchema.js'

const controller = new UserController(userService)
const userRouter = express.Router()
userRouter.get(
  '/',
  controller.getAll
)
userRouter.get(
  '/:userId',
  Validator.paramId('userId',UuidHandler.uuidValidator),
  controller.getById
)
userRouter.post(
  '/',
  Validator.validateBody(sch.createUser),
  controller.create
)
userRouter.put(
  '/:userId',
  Validator.paramId('userId',UuidHandler.uuidValidator),
  Validator.validateBody(sch.updateProfile),
  controller.updateProfile
)
userRouter.delete(
  '/:userId',
  Validator.paramId('userId',UuidHandler.uuidValidator),
  controller.delete
)
userRouter.post(
  '/update-credentials',
  Validator.validateBody(sch.changePassword),
  controller.changePassword
)
userRouter.patch(
  '/:userId/assign-status',
  Validator.paramId('userId',UuidHandler.uuidValidator),
  Validator.validateBody(sch.upgradeUser),
  controller.userUpgrade
)

export default userRouter
