import type { Request, Response } from 'express'
import { responder } from '../../shared/utils/responder.js'
import type { ProductService } from './ProductService.js'

export class ProductController {
  constructor(private readonly service: ProductService) {}

  getAll = async(_req: Request, res: Response) => {
    const response = await this.service.getAll()
    return responder(res, 200, response)
  }

  getById = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.getById(id as string)
    return responder(res, 200, response)
  }

  scopedGet = async(_req: Request, res: Response) => {
    const response = await this.service.getPublicAll()
    return responder(res, 200, response)
  }

  scopedGetById = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.getPublicById(id as string)
    return responder(res, 200, response)
  }

  create = async(req: Request, res: Response) => {
    const data = req.body
    const response = await this.service.create(data)
    return responder(res, 201, response)
  }

  update = async(req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.update(id as string, data)
    return responder(res, 200, response)
  }

  delete = async(req: Request, res: Response) => {
    const { id } = req.params
    const saver = req.body?.saver === true || req.query?.saver === 'true'
    const response = await this.service.delete(id as string, saver)
    return responder(res, 200, response)
  }

  // --- Métodos para Variantes / Items ---

  getVariant = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.getVariant(id as string)
    return responder(res, 200, response)
  }

  scopedGetVariant = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.getPublicVariant(id as string)
    return responder(res, 200, response)
  }

  createVariant = async(req: Request, res: Response) => {
    const data = req.body
    const response = await this.service.createVariant(data)
    return responder(res, 201, response)
  }

  updateVariant = async(req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.updateVariant(id as string, data)
    return responder(res, 200, response)
  }

  deleteVariant = async(req: Request, res: Response) => {
    const { id } = req.params
    const saver = req.body?.saver === true || req.query?.saver === 'true'
    const response = await this.service.deleteVariant(id as string, saver)
    return responder(res, 200, response)
  }
}
