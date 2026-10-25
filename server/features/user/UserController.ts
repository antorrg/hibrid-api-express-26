import { type Request, type Response } from 'express'
import { responder } from '../../shared/utils/responder.js'
import type { userService } from '../../shared/dependencies.js'

type UserServiceType = typeof userService

export class UserController{
  constructor(
       private service: UserServiceType
  ){}
  getAll = async(req:Request, res:Response) => {
    const response = await this.service.getAllUsers()
    return responder(res, 200, response)
  }
  getById = async(req:Request, res:Response) => {
    const { userId } = req.params
    const response = await this.service.getUserById(userId as string)
    return responder(res, 200, response)
  }
  create = async(req:Request, res:Response) => {
    const data = req.body
    const response = await this.service.registerUser(data)
    return responder(res, 201, response )
  }
  updateProfile = async(req:Request, res:Response) => {
    const { userId } = req.params
    const data = req.body
    const response = await this.service.updateProfile(userId as string, data)
    return responder(res, 200, response )
  }
  userUpgrade = async(req:Request, res:Response) => {
    const { userId } = req.params
    const data = req.body
    const response = await this.service.upgradeUser(userId as string, data)
    return responder(res, 200,response )
  }
  changePassword = async(req:Request, res:Response) => {
    const data = req.body
    const response = await this.service.changePassword(data)
    return responder(res, 200, response)
  }

  delete = async(req:Request, res:Response) => {
    const { userId } = req.params
    const response = await this.service.deleteUser(userId as string)
    return responder(res, 200, response )
  }
}