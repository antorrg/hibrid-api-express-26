import express from 'express'
import { AuthService } from './AuthService.js'
import { AuthController } from './AuthController.js'

const authService = new AuthService()
const authController = new AuthController(authService)

const authRouter = express.Router()

authRouter.post(
  '/login', 
  authController.login)
authRouter.post('/logout', authController.logout)
authRouter.get('/me', authController.me)

export default authRouter