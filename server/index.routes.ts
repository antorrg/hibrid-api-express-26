import express from 'express'
import mvcRoutes from './routers/mvc.routes.js'
import publicRouter from './routers/public.routes.js'
import sessionRouter from './routers/session.routes.js'

const mainRouter = express.Router()

//mainRouter.use('/', mvcRoutes)

mainRouter.use('/api/v1/extclients', publicRouter)

mainRouter.use('/api/v1', sessionRouter)

export default mainRouter
