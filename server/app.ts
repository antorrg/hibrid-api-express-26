import path from 'node:path'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import * as eh from './configs/errors.js'
import envConfig from './configs/envConfig.js'
import { getAssetPath } from './configs/getAssetPath.js'
import mainRouter from './index.routes.js'
import mvcRoutes from './routers/mvc.routes.js'


const viewPath = envConfig.Status === 'production' 
  ? path.resolve('dist/views')
  : path.resolve('views')
const staticPath = envConfig.Status === 'production' 
  ? path.resolve('dist/assets')
  : path.resolve('src')
const app = express()
app.locals.getAssetPath = getAssetPath
if(envConfig.Status === 'development'){
  app.use(morgan('dev'))}
app.use(cors())
app.set('view engine', 'ejs')
app.set('views', viewPath)
app.use(express.static(staticPath))
app.use(express.json())
app.use(eh.jsonFormat)
app.use(mvcRoutes)
app.use(mainRouter)
app.use(eh.notFoundRoute)
app.use(eh.errorHandler)

export default app
