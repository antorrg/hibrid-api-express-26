import { QueryTypes } from 'sequelize'
import { VideoGroup as VideoGroupDbModel, Video as VideoDbModel, sequelize } from '../../configs/database.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import { VideoParser } from './videosMappers.js'
import type {
  Ivideo,
  IVideoGroup,
  PublicVGroupResponse,
  PublicVideoResponse,
  VideoGroupUpdate,
  VideoUpdate,
  VideoCreationAttributes,
  VideoGroupCreationAttributes,
  VideoRepository as IVideoRepository
} from './videos.types.js'

export class VideoRepository implements IVideoRepository {
  constructor(
    private readonly videoGroupModel: typeof VideoGroupDbModel = VideoGroupDbModel,
    private readonly videoModel: typeof VideoDbModel = VideoDbModel
  ) {}

  async publicGetVideos(): Promise<PublicVGroupResponse[]> {
    const groups = await sequelize.query<IVideoGroup>(`
      SELECT id, title, description, "productId"
      FROM "${this.videoGroupModel.tableName}"
      WHERE enabled = true;
    `, {
      type: QueryTypes.SELECT
    })

    if (!groups || groups.length === 0) {
      return []
    }

    const groupIds = groups.map(g => g.id)
    const videos = await sequelize.query<Ivideo>(`
      SELECT id, "videoGroupId", name, "youTubeId"
      FROM "${this.videoModel.tableName}"
      WHERE enabled = true
      AND "videoGroupId" IN (:groupIds)
      ORDER BY "id" DESC
    `, {
      replacements: { groupIds },
      type: QueryTypes.SELECT
    })

    const videosByGroup = new Map<string, Ivideo[]>()
    for (const v of videos) {
      const list = videosByGroup.get(v.videoGroupId) || []
      list.push(v)
      videosByGroup.set(v.videoGroupId, list)
    }

    return groups.map(g => VideoParser.publicVGroup({
      ...g,
      videos: (videosByGroup.get(g.id) || []) as any
    }))
  }

  async publicGetVideoGroup(productId: string): Promise<PublicVGroupResponse | string> {
    const groups = await sequelize.query<IVideoGroup>(`
      SELECT id, title, description, "productId"
      FROM "${this.videoGroupModel.tableName}"
      WHERE enabled = true
      AND "productId" = :productId
      LIMIT 1
    `, {
      replacements: { productId },
      type: QueryTypes.SELECT
    })

    if (!groups || groups.length === 0) {
      return 'Videos no implementados aun'
      //throwError(ERROR_CODE.NOT_FOUND, `VideoGroup con ProductId ${productId} no encontrado`)
    }

    const videos = await sequelize.query<Ivideo>(`
      SELECT id, "videoGroupId", name, "youTubeId"
      FROM "${this.videoModel.tableName}"
      WHERE enabled = true
      AND "videoGroupId" = :videoGroupId
      ORDER BY "createdAt" ASC
    `, {
      replacements: { videoGroupId: groups[0].id },
      type: QueryTypes.SELECT
    })

    return VideoParser.publicVGroup({
      ...groups[0],
      videos: (videos || []) as any
    })
  }

  async publicGetVideo(id: string): Promise<PublicVideoResponse> {
    const videos = await sequelize.query<Ivideo>(`
      SELECT id, "videoGroupId", name, "youTubeId"
      FROM "${this.videoModel.tableName}"
      WHERE enabled = true
      AND id = :id
      LIMIT 1
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    })

    if (!videos || videos.length === 0) {
      throwError(ERROR_CODE.NOT_FOUND, `Video con ID ${id} no encontrado`)
    }

    return VideoParser.publicVideo(videos[0])
  }

  async getVideos(): Promise<IVideoGroup[]> {
    const groups = await this.videoGroupModel.findAll({
      include: [{ model: this.videoModel, as: 'videos' }]
    })
    if(groups.length === 0){return []}
    return groups.map(g => VideoParser.VGroup(g))
  }

  async getVideoGroup(id: string): Promise<IVideoGroup> {
    const group = await this.videoGroupModel.findByPk(id, {
      include: [{ model: this.videoModel, as: 'videos' }]
    })
    if (!group) {
      throwError(ERROR_CODE.NOT_FOUND, `VideoGroup con ID ${id} no encontrado`)
    }
    return VideoParser.VGroup(group)
  }

  async getVideo(id: string): Promise<Ivideo> {
    const video = await this.videoModel.findByPk(id)
    if (!video) {
      throwError(ERROR_CODE.NOT_FOUND, `Video con ID ${id} no encontrado`)
    }
    return VideoParser.video(video)
  }

  async videoGroupCreate(data: VideoGroupCreationAttributes): Promise<IVideoGroup> {
    const t = await sequelize.transaction()
    try {
      const group = await this.videoGroupModel.create(
        {
          id: data.id,
          title: data.title,
          description: data.description,
          productId: data.productId,
          enabled: data.enabled ?? true
        } as any,
        { transaction: t }
      )

      if (data.videos && data.videos.length > 0) {
        for (const video of data.videos) {
          await this.videoModel.create(
            {
              id: video.id,
              videoGroupId: group.id,
              name: video.name,
              youTubeId: video.youTubeId,
              enabled: video.enabled ?? true
            } as any,
            { transaction: t }
          )
        }
      }

      await t.commit()

      const created = await this.videoGroupModel.findByPk(group.id, {
        include: [{ model: this.videoModel, as: 'videos' }]
      })
      return VideoParser.VGroup(created!)
    } catch (error) {
      await t.rollback()
      throw error
    }
  }

  async videoGroupUpdate(id: string, data: VideoGroupUpdate): Promise<IVideoGroup> {
    const group = await this.videoGroupModel.findByPk(id)
    if (!group) {
      throwError(ERROR_CODE.NOT_FOUND, `VideoGroup con ID ${id} no encontrado`)
    }

    await group.update(data as any)

    const updated = await this.videoGroupModel.findByPk(id, {
      include: [{ model: this.videoModel, as: 'videos' }]
    })
    return VideoParser.VGroup(updated!)
  }

  async videoGroupDelete(id: string): Promise<string> {
    const group = await this.videoGroupModel.findByPk(id)
    if (!group) {
      throwError(ERROR_CODE.NOT_FOUND, `VideoGroup con ID ${id} no encontrado`)
    }

    const t = await sequelize.transaction()
    try {
      await this.videoModel.destroy({
        where: { videoGroupId: id },
        transaction: t
      })
      await group.destroy({ transaction: t })
      await t.commit()
      return `VideoGroup ${id} eliminado exitosamente`
    } catch (error) {
      await t.rollback()
      throw error
    }
  }

  async videoCreate(data: VideoCreationAttributes): Promise<Ivideo> {
    const videoGroupId = data.videoGroupId
    if (!videoGroupId) {
      throwError(ERROR_CODE.REQUIRED_FIELD_MISSING, 'videoGroupId es requerido')
    }

    const groupExists = await this.videoGroupModel.findByPk(videoGroupId)
    if (!groupExists) {
      throwError(ERROR_CODE.NOT_FOUND, `VideoGroup con ID ${videoGroupId} no encontrado`)
    }

    const video = await this.videoModel.create(data as any)
    return VideoParser.video(video)
  }

  async videoUpdate(id: string, data: VideoUpdate): Promise<Ivideo> {
    const video = await this.videoModel.findByPk(id)
    if (!video) {
      throwError(ERROR_CODE.NOT_FOUND, `Video con ID ${id} no encontrado`)
    }

    await video.update(data as any)
    return VideoParser.video(video)
  }

  async videoDelete(id: string): Promise<string> {
    const video = await this.videoModel.findByPk(id)
    if (!video) {
      throwError(ERROR_CODE.NOT_FOUND, `Video con ID ${id} no encontrado`)
    }

    await video.destroy()
    return `Video ${id} eliminado exitosamente`
  }
}
