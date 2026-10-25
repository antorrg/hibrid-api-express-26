import type { Request, Response } from 'express'
import { responder } from '../../shared/utils/responder.js'
import type { ApiKeyService } from './ApiKeyService.js'
import type { ClientQueries } from './ApiKey.types.js'

export class ApiKeyController {
  constructor(private readonly service: ApiKeyService) {}

  register = async(req: Request, res: Response) => {
    const data = req.body
    const response = await this.service.register(data)
    return responder(res, 201, response)
  }

  getAll = async(req: Request, res: Response) => {
    const options: ClientQueries = {
      page: req.context?.query?.page ?? req.query.page,
      limit: req.context?.query?.limit ?? req.query.limit
    }
    const response = await this.service.getAllClients(options)
    return responder(res, 200, response)
  }

  getClientById = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.getClientById(id as string)
    return responder(res, 200, response)
  }

  clientUpdater = async(req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.clientUpdate(id as string, data)
    return responder(res, 200, response)
  }

  apiEnableDisable = async(req: Request, res: Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.apiKeyEnabledDisabled(id as string, data)
    return responder(res, 200, response)
  }

  clientDeleter = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.clientDelete(id as string)
    return responder(res, 200, response)
  }

  apiKeyDeleter = async(req: Request, res: Response) => {
    const { id } = req.params
    const response = await this.service.apiKeyDelete(id as string)
    return responder(res, 200, response)
  }
}