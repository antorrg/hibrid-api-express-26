import express from 'express'
import cors from 'cors'
import { sessionCorsConfig, publicApiCorsConfig } from './configs/corsConfig.js'
import publicRouter from './routers/public.routes.js'
import sessionRouter from './routers/session.routes.js'

const mainRouter = express.Router()

mainRouter.use('/api/v1/extclients', cors(publicApiCorsConfig), publicRouter)

mainRouter.use('/api/v1', cors(sessionCorsConfig), sessionRouter)

export default mainRouter
