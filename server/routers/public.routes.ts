import express from 'express'
import publicLetterRouter from '../features/cartas/public.letter.routes.js'
import { createRateLimiter } from '../shared/utils/createRateLimiter.js'

const publicRouter = express.Router()


publicRouter.use('/letters', publicLetterRouter)

export default publicRouter