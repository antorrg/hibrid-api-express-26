import type { BaseRepository } from '../../shared/repositories/BaseRepository.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import type { ImageService } from '../images/ImageService.js'
import {
  type IAboutCreate,
  type IAboutUpdate,
  type IAbout,
  type IAboutService
} from './About.types.js'
import logger from '../../configs/logger.js'

export class AboutService implements IAboutService {
  protected readonly Repository: BaseRepository<IAbout, IAboutCreate, IAboutUpdate>
  private readonly imageService: ImageService

  constructor(
    Repository: BaseRepository<IAbout, IAboutCreate, IAboutUpdate>,
    imageService: ImageService
  ) {
    this.Repository = Repository
    this.imageService = imageService
  }

  async get(): Promise<IAbout> {
    let response = await this.Repository.getAllEnabled()
    if (!response || response.length === 0) {
      response = [{
        id: UuidHandler.createUuid(),
        title: 'No title',
        picture: 'nopicture',
        text: 'no data yet',
        imgShow: false,
        enabled:true
      }]
    }
    return response[0]
  }

  async create(data: IAboutCreate): Promise<void> {
    const newData = {
      id: UuidHandler.createUuid(),
      ...data,
      enabled: true
    }
    await this.Repository.create(newData)

    if (data.picture) {
      await this.imageService.consumeImage(data.picture).catch(error => {
        logger.warn(`[AboutService.create] Error consumiendo imagen: ${error}`)
      })
    }
  }

  async update(id: string, data: IAboutUpdate): Promise<IAbout> {
    let oldPicture: string | undefined
    if (data.picture) {
      const current = await this.get().catch(() => null)
      oldPicture = current?.picture
    }

    const { saver, ...updateData } = data as IAboutUpdate & { saver?: boolean | string }
    const updated = await this.Repository.update(id, updateData)

    if (data.picture && data.picture !== oldPicture) {
      await this.imageService.handleReplacedImage(oldPicture, data.picture, saver).catch(error => {
        logger.warn(`[AboutService.update] Error al reemplazar imagen: ${error}`)
      })
    }

    return updated
  }
}