import { ERROR_CODE, throwError } from '../../configs/errors.js'
import { BaseRepository } from '../../shared/repositories/BaseRepository.js'
import { Image } from '../../configs/database.js'
import type { IImage, IImageRepository, ImageQueries, PagesResult } from './Image.types.js'
import type { Image as ImageDb } from '../../models/images.model.js'

export class ImageDbRepository implements IImageRepository {
  private base: BaseRepository<IImage, IImage, Partial<IImage>, ImageDb>
  private Model: typeof ImageDb

  constructor(
    Model: typeof Image = Image
  ) {
    this.base = new BaseRepository(Model, this.parser, this.parser, 'Image', 'imageUrl')
    this.Model = Model
  }

  parser = (raw: ImageDb | IImage): IImage => {
    return {
      id: raw.id,
      imageUrl: raw.imageUrl
    }
  }

  async save(data: IImage): Promise<void> {
    await this.base.create(data)
  }

  async internalRemove(imageUrl: string): Promise<string> {
    const record = await this.Model.findOne({ where: { imageUrl } })
    if (!record) {
      throwError(ERROR_CODE.NOT_FOUND, 'Imagen no encontrada')
    }
    await record.destroy()
    return `Imagen ${imageUrl} borrada exitosamente`
  }

  async remove(id: string): Promise<string> {
    const record = await this.Model.findByPk(id)
    if (!record) {
      throwError(ERROR_CODE.NOT_FOUND, 'Imagen no encontrada')
    }
    const url = record.imageUrl
    await record.destroy()
    return `Imagen ${url} borrada exitosamente`
  }

  async getWithPages(query?: ImageQueries): Promise<PagesResult> {
    const page = query?.page ? Number(query.page) : 1
    const limit = query?.limit ? Number(query.limit) : 5
    const order = (query?.order === 'ASC' || query?.order === 'DESC')
      ? query.order
      : 'DESC'
    const offset = (page - 1) * limit

    //* Metodo de busqueda:
    const { rows, count } = await this.Model.findAndCountAll({
      limit,
      offset,
      order: [['id', order]],
      distinct: true
    })

    return {
      info: {
        currentPage: page,
        pages: Math.ceil(count / limit),
        total: count
      },
      data: rows.map(r => this.parser(r as unknown as ImageDb))
    }
  }

  async getImage(id: string): Promise<IImage> {
    const record = await this.Model.findByPk(id)
    if (!record) {
      throwError(ERROR_CODE.NOT_FOUND, 'Imagen no encontrada')
    }
    return this.parser(record)
  }
}
