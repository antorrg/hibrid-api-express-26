import express from 'express'
import * as handler from '../features/frontPageRender/FrontPageRenderHandlers.js'
import { ERROR_CODE, middError } from '../configs/errors.js'

const mvcRoutes = express.Router()
mvcRoutes.get('/', handler.getFrontPage)
mvcRoutes.get(
  '/detalles',
  handler.getProducts
)
mvcRoutes.get(
  '/detalles/:productId',
  handler.getDetail
)
mvcRoutes.get(
  '/detalles/item/:id',
  handler.getVariants
)
mvcRoutes.get('/videos/:id',
  handler.videoProduct 
)
mvcRoutes.get(
  '/contacto',
  handler.contact
)
mvcRoutes.get(
  '/acerca',
  handler.about
)
mvcRoutes.get(
  '/login', 
  handler.getReactPage
)
mvcRoutes.get(
  '/admin', 
  handler.getReactPage
)

export default mvcRoutes