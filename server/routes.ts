import express from 'express'
import { isAuthenticated, UserRole, authorizeMinRole } from './shared/auth/authMiddlewares.js'
import userRouter from './features/user/user.routes.js'
import logRouter from './features/system-logs/log.routes.js'
import authRouter from './features/auth/auth.routes.js'
import imageRouter from './features/images/images.routes.js'
import apiKeyRouter from './features/apiKey/apiKey.routes.js'
import letterRouter from './features/cartas/letter.routes.js'
import contactRouter from './features/contact/contact.routes.js'
import productRouter from './features/product/product.routes.js'

const mainRouter = express.Router()

mainRouter.use('/api/v1/auth', authRouter)

mainRouter.use('/api/v1/user', userRouter)

mainRouter.use('/api/v1/images', isAuthenticated, authorizeMinRole(UserRole.ADMIN), imageRouter)

mainRouter.use('/api/v1/logs', isAuthenticated, authorizeMinRole(UserRole.ADMIN), logRouter)

mainRouter.use('/api/v1/apiKey', isAuthenticated, authorizeMinRole(UserRole.ADMIN), apiKeyRouter)

mainRouter.use('/api/v1/cartas', letterRouter)

mainRouter.use('/api/v1/contact', contactRouter)

mainRouter.use('/api/v1/product', productRouter)

export default mainRouter
