import type {
  Ivideo,
  IVideoGroup,
  PublicVGroupResponse,
  PublicVideoResponse,
  VideoCreate,
  VideoGroupCreate,
  VideoGroupUpdate,
  VideoUpdate,
  VideoCreationAttributes,
  VideoGroupCreationAttributes,
  VideoRepository
} from './videos.types.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'

export class VideosService {
  constructor(
    private readonly repository: VideoRepository
  ) {}

  async publicGetVideos(): Promise<PublicVGroupResponse[]> {
    return await this.repository.publicGetVideos()
  }

  async publicGetVideoGroup(productId: string): Promise<PublicVGroupResponse | string> {
    return await this.repository.publicGetVideoGroup(productId)
  }

  async publicGetVideo(id: string): Promise<PublicVideoResponse> {
    return await this.repository.publicGetVideo(id)
  }

  async getVideos(): Promise<IVideoGroup[]> {
    return await this.repository.getVideos()
  }

  async getVideoGroup(id: string): Promise<IVideoGroup> {
    return await this.repository.getVideoGroup(id)
  }

  async getVideo(id: string): Promise<Ivideo> {
    return await this.repository.getVideo(id)
  }

  async videoGroupCreate(data: VideoGroupCreate): Promise<IVideoGroup> {
    const videoGroupId = UuidHandler.createUuid()
    const videosRaw = data.videos ?? []

    const videosPayload: VideoCreationAttributes[] = videosRaw.map(v => ({
      id: UuidHandler.createUuid(),
      videoGroupId,
      name: v.name,
      youTubeId: v.youTubeId,
      enabled: true
    }))

    const groupPayload: VideoGroupCreationAttributes = {
      id: videoGroupId,
      title: data.title,
      description: data.description,
      productId: data.productId,
      enabled: true,
      videos: videosPayload
    }

    return await this.repository.videoGroupCreate(groupPayload)
  }

  async videoGroupUpdate(id: string, data: VideoGroupUpdate): Promise<IVideoGroup> {
    return await this.repository.videoGroupUpdate(id, data)
  }

  async videoGroupDelete(id: string): Promise<string> {
    return await this.repository.videoGroupDelete(id)
  }

  async videoCreate(data: VideoCreate): Promise<Ivideo> {
    if (!data.videoGroupId) {
      throwError(ERROR_CODE.REQUIRED_FIELD_MISSING, 'videoGroupId es requerido')
    }

    const videoPayload: VideoCreationAttributes = {
      id: UuidHandler.createUuid(),
      videoGroupId: data.videoGroupId,
      name: data.name,
      youTubeId: data.youTubeId,
      enabled: true
    }

    return await this.repository.videoCreate(videoPayload)
  }

  async videoUpdate(id: string, data: VideoUpdate): Promise<Ivideo> {
    return await this.repository.videoUpdate(id, data)
  }

  async videoDelete(id: string): Promise<string> {
    return await this.repository.videoDelete(id)
  }
}
