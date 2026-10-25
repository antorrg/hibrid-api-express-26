import { ERROR_CODE, throwError } from '../../configs/errors.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import type { IImage, ImageQueries, PagesResult } from './Image.types.js'
import type { ImageDbRepository } from './ImageDbRepository.js'

export class ImageDbService {
  private repository: ImageDbRepository
  private imageDeleteService: (imageUrl: string) => Promise<unknown>

  constructor(
    repository: ImageDbRepository,
    imageDeleteService: (imageUrl: string) => Promise<unknown>
  ) {
    this.repository = repository
    this.imageDeleteService = imageDeleteService
  }

  async save(imageUrl: string): Promise<void> {
    const data = {
      id: UuidHandler.createUuid(),
      imageUrl
    }
    return await this.repository.save(data)
  }

  async getWithPages(query: ImageQueries): Promise<PagesResult> {
    return await this.repository.getWithPages(query)
  }

  async getImage(id: string): Promise<IImage> {
    return await this.repository.getImage(id)
  }

  async remove(id: string): Promise<string> {
    const register = await this.getImage(id)
    if (!register) {
      throwError(ERROR_CODE.NOT_FOUND, '[ImageDbService.remove], Imagen no hallada')
    }
    await this.imageDeleteService(register.imageUrl)
    await this.repository.remove(id)
    return 'Imagen eliminada exitosamente'
  }

  async internalRemove(imageUrl: string): Promise<string> {
    return await this.repository.internalRemove(imageUrl)
  }
}