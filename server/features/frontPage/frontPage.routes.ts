import express from 'express'
import { FrontPageController } from './FrontPageController.js'
import { frontPageService } from '../../shared/dependencies.js'
import { isAuthenticated, authorizeMinRole, UserRole } from '../../shared/auth/authMiddlewares.js'

const controller = new FrontPageController(frontPageService)
const frontPageRouter = express.Router()

frontPageRouter.get('/', controller.get)
frontPageRouter.post('/', isAuthenticated, authorizeMinRole(UserRole.ADMIN), controller.create)
frontPageRouter.put('/:id', isAuthenticated, authorizeMinRole(UserRole.ADMIN), controller.update)

export default frontPageRouter
