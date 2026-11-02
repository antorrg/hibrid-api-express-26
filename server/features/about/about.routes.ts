import express from 'express'
import { AboutController } from './AboutController.js'
import { aboutService } from '../../shared/dependencies.js'
import { isAuthenticated, authorizeMinRole, UserRole } from '../../shared/auth/authMiddlewares.js'

const controller = new AboutController(aboutService)
const aboutRouter = express.Router()

aboutRouter.get('/', controller.get)
aboutRouter.post(
  '/', 
  isAuthenticated, 
  authorizeMinRole(UserRole.ADMIN), 
  controller.create
)
aboutRouter.put(
  '/:id', 
  isAuthenticated, 
  authorizeMinRole(UserRole.ADMIN), 
  controller.update
)

export default aboutRouter
