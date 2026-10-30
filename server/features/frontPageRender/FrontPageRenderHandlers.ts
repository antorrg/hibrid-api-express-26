import type { Request, Response } from 'express'
import * as service from '../../shared/dependencies.js'
import * as help from './helpers.js'
import { HMACToken } from '../../shared/auth/HMACToken.js'

export const getFrontPage = async(req:Request, res:Response) => {
  console.time('⏱️ RenderTime api + ejs')
  const frontPageData =  await service.frontPageService.get()
  const data = {
    url: help.url(),
    frontPage: frontPageData,
    products: await service.productService.getPublicAll(),
    meta: frontPageData.info_header ?? 'antorrg',
    isAuthenticated: help.getAuth(req)
  }
  console.log('los datos', data)
  res.render('landings', data)
  console.timeEnd('⏱️ RenderTime api + ejs')
}
export const getProducts = async(req:Request, res:Response) => {
  const products = await service.productService.getPublicAll()
  const data = {
    url: help.url(),
    products,
    meta: products[0].info_header,
    isAuthenticated: help.getAuth(req)
  }
  res.render('products', data)
}
export const getDetail = async(req:Request<{productId:string}>, res:Response) => {
  const { productId } = req.params
  const { id, info_header, info_body, logo, picture, title, variants } = await service.productService.getPublicById(productId)
  help.setStored(info_header? info_header : 'antorrg-software')
  const data = {
    url: help.url(),
    info: { id, info_header, info_body, logo, picture, title },
    variants,
    meta: help.getStored(),
    isAuthenticated: help.getAuth(req)
  }
  res.render('details', data)
}
export const getVariants = async(req:Request<{id:string}>, res:Response) => {
  const { id } = req.params
  const variant = await service.productService.getPublicVariant(id)
  const data = {
    url: help.url(),
    variant,
    meta: help.getStored(),
    isAuthenticated: help.getAuth(req)
  }
  res.render('item', data)
}
export const contact = async(req:Request, res:Response) => {
  const csrfToken = HMACToken.create()
  const data = {
    url: help.url(),
    meta: help.getStored() || 'Contacto - Antorrg',
    isAuthenticated: help.getAuth(req),
    csrfToken,
    uriWhatsApp: help.uriWhatsApp
  }
  //console.log('dataContact: ', data)
  res.render('contact', data)
}
export const videos = async(req:Request, res:Response) => {
  const videos = await service.videoService.publicGetVideos()
  const data = {
    url: help.url(),
    videos,
    meta: help.getStored(),
    isAuthenticated: help.getAuth(req)
  }
  return res.render('videos', data)

}
export const videoProduct = async(req:Request<{id:string}>, res:Response) => {
  const { id } = req.params
  const video = await service.videoService.publicGetVideo(id)
  const data = {
    url: help.url(),
    video,
    meta: help.getStored(),
    isAuthenticated: help.getAuth(req)
  }
  return res.render('videos', data)
}
export const about = async(req:Request, res:Response) => {
  const data = {
    url: help.url(),
    meta: help.getStored(),
    isAuthenticated: help.getAuth(req)
  }
  return res.render('about', data)
}
export const getReactPage = async(req:Request, res:Response) => {
  return res.render('index')
}