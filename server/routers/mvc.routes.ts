import express from 'express'
import * as handler from '../features/frontPageRender/FrontPageRenderHandlers.js'

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
mvcRoutes.get(
  '/detalles/false/:id', 
  (req, res, next)=>{ //eslint-disable-line
  // res.status(404).send('Not Found')
    res.render('error', { message: 'Error forzado', status: 404 })
  }
)
export default mvcRoutes
/*
mvcRouter.get('/videos/:id',
  controller.getVideos
)

mvcRouter.get('/login', 
  controller.getReact);

mvcRouter.get('/admin', 
  controller.getReact);

mvcRouter.get('/detalles/false', (req, res, next)=>{ //eslint-disable-line
        // res.status(404).send('Not Found')
         res.render('error', { message: 'Not Found', status: 404});
       });
      */