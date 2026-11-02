import type { Request, Response } from 'express'
import { responder } from '../../shared/utils/responder.js'
import type { AboutService } from './AboutService.js'

export class AboutController {
  constructor(private readonly service: AboutService) { }

  get = async (_req: Request, res: Response) => {
    const response = await this.service.get()
    return responder(res, 200, response)
  }

  create = async (req: Request, res: Response) => {
    const data = req.body
    await this.service.create(data)
    return responder(res, 201, { message: 'About creado exitosamente' })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.update(id as string, data)
    return responder(res, 200, response)
  }
}
