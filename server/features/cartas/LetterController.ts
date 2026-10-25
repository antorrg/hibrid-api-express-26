import type { Request, Response } from 'express'
import { responder } from '../../shared/utils/responder.js'
import type { LetterService } from './LetterService.js'
import type { LetterAdminQueries } from './Letter.types.js'

export class LetterController {
  constructor(private readonly service: LetterService) {}

  create = async(req: Request, res: Response) => {
    const data = req.body
    const response = await this.service.createLetter(data)
    return responder(res, 201, response)
  }

  getAll = async(req: Request, res: Response) => {
    const page = Number(req.context?.query?.page ?? req.query.page) || 1
    const limit = Number(req.context?.query?.limit ?? req.query.limit) || 10
    const response = await this.service.getAll(page, limit)
    return responder(res, 200, response)
  }

  getAllAdmin = async(req: Request, res: Response) => {
    const query = (req.context?.query ?? req.query) as LetterAdminQueries
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const response = await this.service.findAllLetters(page, query.aprobada, limit, query.tema)
    return responder(res, 200, response)
  }

  getById = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.getById(id as string)
    return responder(res, 200, response)
  }

  moderateLetter = async(req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.moderateLetter(id as string, data)
    return responder(res, 200, response)
  }

  delete = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.deleteLetter(id as string)
    return responder(res, 200, response)
  }
}
