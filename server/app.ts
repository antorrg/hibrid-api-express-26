import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import * as eh from './configs/errors.js'
import mainRouter from './index.routes.js'
import envConfig from './configs/envConfig.js'


const app = express()
if(envConfig.Status === 'development'){
  app.use(morgan('dev'))}
app.use(cors())
app.use(express.json())
app.use(eh.jsonFormat)
app.use(mainRouter)
app.use(eh.notFoundRoute)
app.use(eh.errorHandler)

export default app
