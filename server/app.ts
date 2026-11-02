import path from 'node:path'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { corsConfig } from './configs/corsConfig.js'
import * as eh from './configs/errors.js'
import envConfig from './configs/envConfig.js'
import { getAssetPath } from './configs/getAssetPath.js'
import mainRouter from './index.routes.js'
import mvcRoutes from './routers/mvc.routes.js'


const viewPath = envConfig.Status === 'production' 
  ? path.resolve('dist/views')
  : path.resolve('views')

const app = express()
app.locals.getAssetPath = getAssetPath
if (envConfig.Status === 'production') {
  app.set('trust proxy', 1)
}
if(envConfig.Status === 'development'){
  app.use(morgan('dev'))}
app.use(cors(corsConfig))
app.set('view engine', 'ejs')
app.set('views', viewPath)

if (envConfig.Status === 'production') {
  app.use(express.static(path.resolve('dist')))
  app.use(express.static(path.resolve('dist/assets')))
} else {
  app.use(express.static(path.resolve('src')))
  app.use(express.static(path.resolve('public')))
}
if (envConfig.Status !== 'production') {
  app.use(`/${envConfig.BaseTestUrl}`, express.static(path.resolve(envConfig.BaseTestUrl)))
}
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(eh.jsonFormat)
app.use(mvcRoutes)
app.use(mainRouter)
app.use(eh.notFoundRoute)
app.use(eh.errorHandler)

export default app
