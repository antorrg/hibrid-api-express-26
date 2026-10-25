import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import * as eh from './configs/errors.js'
import mainRouter from './routes.js'
import cookieParser from 'cookie-parser'
import { sessionMiddleware } from './shared/auth/session.js'
import * as auth from './shared/auth/authMiddlewares.js'


const app = express()
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(eh.jsonFormat)
app.use(cookieParser())
app.use(sessionMiddleware)
app.use(auth.csrfProtection)
app.use(auth.setCsrfToken)
app.use(auth.verifyCsrfToken)
app.use(mainRouter)
app.use(eh.notFoundRoute)
app.use(eh.errorHandler)

export default app
