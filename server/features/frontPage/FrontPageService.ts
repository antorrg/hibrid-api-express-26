import type { BaseRepository } from '../../shared/repositories/BaseRepository.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import type { ImageService } from '../images/ImageService.js'
import {
  type IFrontCreate,
  type IFrotnUpdate,
  type IFrontPage,
  type IFrontService
} from './FrontPage.types.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import logger from '../../configs/logger.js'

export class FrontPageService implements IFrontService {
  protected readonly Repository: BaseRepository<IFrontPage, any, IFrotnUpdate>
  private readonly imageService: ImageService

  constructor(
    Repository: BaseRepository<IFrontPage, any, IFrotnUpdate>,
    imageService: ImageService
  ) {
    this.Repository = Repository
    this.imageService = imageService
  }

  async get(): Promise<IFrontPage> {
    const response = await this.Repository.getAllEnabled()
    if (!response || response.length === 0) {
      throwError(ERROR_CODE.NOT_FOUND, 'FrontPage no encontrada')
    }
    return response[0]
  }

  async create(data: IFrontCreate): Promise<void> {
    const newData = {
      id: UuidHandler.createUuid(),
      ...data,
      enabled: true
    }
    await this.Repository.create(newData)

    if (data.picture) {
      await this.imageService.consumeImage(data.picture).catch(error => {
        logger.warn(`[FrontPageService.create] Error consumiendo imagen: ${error}`)
      })
    }
  }

  async update(id: string, data: IFrotnUpdate): Promise<IFrontPage> {
    let oldPicture: string | undefined
    if (data.picture) {
      const current = await this.get().catch(() => null)
      oldPicture = current?.picture
    }

    const { saver, ...updateData } = data as IFrotnUpdate & { saver?: boolean | string }
    const updated = await this.Repository.update(id, updateData)

    if (data.picture && data.picture !== oldPicture) {
      await this.imageService.handleReplacedImage(oldPicture, data.picture, saver).catch(error => {
        logger.warn(`[FrontPageService.update] Error al reemplazar imagen: ${error}`)
      })
    }

    return updated
  }
}