import express from 'express'
import { AuthService } from './AuthService.js'
import { AuthController } from './AuthController.js'
import { createRateLimiter } from '../../shared/utils/createRateLimiter.js'
import envConfig from '../../configs/envConfig.js'

const skipRateLimitInTest = envConfig.Status === 'test'? true :false


const loginFailedLimiter = createRateLimiter({
  windowMs: 60* 1000,
  limit: 1,
  skip: () => skipRateLimitInTest,
  skipSuccessfulRequests:true
})
const excesiveLogInLimiter = createRateLimiter({
  windowMs: 60 * 60* 1000,
  limit: 4,
  skip: () => skipRateLimitInTest
})
const authService = new AuthService()
const authController = new AuthController(authService)

const authRouter = express.Router()

authRouter.post(
  '/login', 
  //loginFailedLimiter,
  //excesiveLogInLimiter,
  authController.login)

  
authRouter.get('/me', authController.me)
  
authRouter.post('/logout', authController.logout)
export default authRouter