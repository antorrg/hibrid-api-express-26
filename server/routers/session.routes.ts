import express from 'express'
import cookieParser from 'cookie-parser'
import { sessionMiddleware } from '../shared/auth/session.js'
import * as auth from '../shared/auth/authMiddlewares.js'
import { isAuthenticated, UserRole, authorizeMinRole } from '../shared/auth/authMiddlewares.js'
import userRouter from '../features/user/user.routes.js'
import logRouter from '../features/system-logs/log.routes.js'
import authRouter from '../features/auth/auth.routes.js'
import imageRouter from '../features/images/images.routes.js'
import apiKeyRouter from '../features/apiKey/apiKey.routes.js'
import letterRouter from '../features/cartas/letter.routes.js'
import contactRouter from '../features/contact/contact.routes.js'
import productRouter from '../features/product/product.routes.js'

const sessionRouter = express.Router()
sessionRouter.use(cookieParser())
sessionRouter.use(sessionMiddleware)
sessionRouter.use(auth.csrfProtection)
sessionRouter.use(auth.setCsrfToken)

// Rutas públicas con su propia protección de token (HMACToken / sin requerir login)
sessionRouter.use('/contact', contactRouter)

sessionRouter.use(auth.verifyCsrfToken)

sessionRouter.use('/auth', authRouter)

sessionRouter.use('/user', userRouter)

sessionRouter.use('/images', isAuthenticated, authorizeMinRole(UserRole.ADMIN), imageRouter)

sessionRouter.use('/logs', isAuthenticated, authorizeMinRole(UserRole.ADMIN), logRouter)

sessionRouter.use('/apiKey', isAuthenticated, authorizeMinRole(UserRole.ADMIN), apiKeyRouter)

sessionRouter.use('/letters', isAuthenticated, authorizeMinRole(UserRole.ADMIN), letterRouter)

sessionRouter.use('/product', productRouter)

export default sessionRouter