import express from 'express'
import { Validator } from 'req-valid-express'
import { AuthService } from './AuthService.js'
import { AuthController } from './AuthController.js'
import { createRateLimiter } from '../../shared/utils/createRateLimiter.js'
import envConfig from '../../configs/envConfig.js'
import loginSchema from './login-schema.js'

const skipRateLimitInTest = envConfig.Status === 'test'? true :false


const loginFailedLimiter = createRateLimiter({
  windowMs: 60* 1000,
  limit: 1,
  skip: () => skipRateLimitInTest,
  skipSuccessfulRequests:true
})

const authService = new AuthService()
const authController = new AuthController(authService)

const authRouter = express.Router()

authRouter.post(
  '/login', 
  loginFailedLimiter,
  Validator.validateBody(loginSchema),
  authController.login)
  
authRouter.get('/me', authController.me)
  
authRouter.post('/logout', authController.logout)

export default authRouter