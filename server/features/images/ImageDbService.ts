import { ERROR_CODE, throwError } from '../../configs/errors.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import type { IImage, ImageQueries, PagesResult, IImageDbService, ImageDeleteFn } from './Image.types.js'
import type { ImageDbRepository } from './ImageDbRepository.js'
import logger from '../../configs/logger.js'

export class ImageDbService implements IImageDbService {
  private repository: ImageDbRepository
  private imageDeleteService: ImageDeleteFn

  constructor(
    repository: ImageDbRepository,
    imageDeleteService: ImageDeleteFn
  ) {
    this.repository = repository
    this.imageDeleteService = imageDeleteService
  }

  save = async(imageUrl: string): Promise<void> => {
    const data = {
      id: UuidHandler.createUuid(),
      imageUrl
    }
    return await this.repository.save(data)
  }

  getWithPages = async(query: ImageQueries): Promise<PagesResult> => {
    return await this.repository.getWithPages(query)
  }

  getImage = async(id: string): Promise<IImage> => {
    return await this.repository.getImage(id)
  }

  remove = async(id: string): Promise<string> => {
    const register = await this.getImage(id)
    if (!register) {
      throwError(ERROR_CODE.NOT_FOUND, '[ImageDbService.remove], Imagen no hallada')
    }
    await this.imageDeleteService(register.imageUrl)
    await this.repository.remove(id)
    return 'Imagen eliminada exitosamente'
  }

  async #internalRemove(imageUrl: string): Promise<string> {
    return await this.repository.internalRemove(imageUrl)
  }

  consumeImage = async(url?: string | null): Promise<void> => {
    if (!url) return
    await this.#internalRemove(url)
  }

  handleReplacedImage = async(
    oldUrl?: string | null,
    newUrl?: string | null,
    saver?: boolean | string
  ): Promise<void> => {
    if (!newUrl || newUrl === oldUrl) return

    // Se consume la nueva imagen eliminándola de la DB (galería temporal)
    try {
      await this.consumeImage(newUrl)
    } catch (error) {
      logger.warn(`[ImageDbService.handleReplacedImage] Error consumiendo nueva imagen "${newUrl}": ${error}`)
    }

    if (!oldUrl) return

    // Si saver es true, la imagen vieja se preserva en la galería de la DB
    // Si saver es false, la imagen vieja se elimina físicamente de Firebase / Storage
    const shouldSave = saver === true || String(saver) === 'true'
    if (shouldSave) {
      await this.save(oldUrl)
    } else {
      await this.imageDeleteService(oldUrl)
    }
  }

  handleDeletedImage = async(
    url?: string | null,
    saver?: boolean | string
  ): Promise<void> => {
    if (!url) return

    const shouldSave = saver === true || String(saver) === 'true'
    if (shouldSave) {
      await this.save(url)
    } else {
      await this.imageDeleteService(url)
    }
  }
}