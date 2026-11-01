import type { Request, Response } from 'express'
import { responder } from '../../shared/utils/responder.js'
import type { VideosService } from './VideosService.js'
import type { 
  VideoGroupCreate,
  VideoCreate,
  VideoGroupUpdate, 
  VideoUpdate,
  VGQuery
} from './videos.types.js'

export class VideoController{
  constructor( private readonly service: VideosService){}

  getAllGroup = async(req:Request, res:Response) => {
    const query = req.context!.query as VGQuery
    const response = await this.service.getVideos(query)
    responder(res, 200, response)
  }

  getGroupById = async(req:Request<{id:string}>, res:Response) => {
    const { id } = req.params
    const response = await this.service.getVideoGroup(id)
    responder(res, 200, response)
  }

  getVideo = async(req:Request<{id:string}>, res:Response) => {
    const { id } = req.params
    const response = await this.service.getVideo(id)
    responder(res, 200, response)
  }

  createGroup = async(req:Request<Record<string, string>, unknown, VideoGroupCreate>, res:Response) => {
    const data = req.body
    const response = await this.service.videoGroupCreate(data)
    responder(res, 201, response)
  }

  createVideo = async(req:Request<Record<string, string>, unknown, VideoCreate>, res:Response) => {
    const data = req.body
    const response = await this.service.videoCreate(data)
    responder(res, 201, response)
  }

  updateGroup = async(req:Request<{id:string}, unknown, VideoGroupUpdate>, res:Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.videoGroupUpdate(id, data)
    responder(res, 200, response)
  }

  updateVideo = async(req:Request<{id: string}, unknown, VideoUpdate>, res:Response) => {
    const { id } = req.params
    const data = req.body
    const response = await this.service.videoUpdate(id, data)
    responder(res, 200, response)
  }

  deleteGroup = async(req:Request<{id: string}>, res:Response) => {
    const { id } = req.params
    const response = await this.service.videoGroupDelete(id)
    responder(res, 200, response)
  }

  deleteVideo = async(req:Request<{id: string}>, res:Response) => {
    const { id } = req.params
    const response = await this.service.videoDelete(id)
    responder(res, 200, response)
  }
}