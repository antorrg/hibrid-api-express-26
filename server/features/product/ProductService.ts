import type {
  IProduct,
  IProductSummary,
  IVariantProduct,
  CreateProductDTO,
  UpdateProductDTO,
  CreateVariantDTO,
  UpdateVariantDTO,
  IProductRepository
} from './Product.types.js'
import type { ImageDbService } from '../images/ImageDbService.js'
import logger from '../../configs/logger.js'

export type ImageDeleteFn = (imageUrl: string) => Promise<unknown>

export class ProductService {
  constructor(
    private readonly repository: IProductRepository,
    private readonly imageDbService: ImageDbService,
    private readonly deleteOldImage: ImageDeleteFn
  ) {}

  async getAll(): Promise<IProductSummary[]> {
    return await this.repository.getAllProducts()
  }

  async getPublicAll(): Promise<IProductSummary[]> {
    return await this.repository.getPublicProducts()
  }

  async getById(id: string): Promise<IProduct> {
    return await this.repository.getProductById(id)
  }

  async getPublicById(id: string): Promise<IProduct> {
    return await this.repository.getPublicProductById(id)
  }

  async create(data: CreateProductDTO): Promise<IProduct> {
    const created = await this.repository.createProduct(data)

    // Al ingresar imágenes (ya existen en storage y db), se consumen borrándolas de la DB
    const imagesToConsume = [
      data.picture,
      data.logo,
      ...(data.variants ?? data.items ?? []).map(v => v.picture)
    ].filter(Boolean) as string[]

    if (imagesToConsume.length > 0) {
      const results = await Promise.allSettled(
        imagesToConsume.map(url => this.consumeImage(url))
      )
      results.forEach((res, i) => {
        if (res.status === 'rejected') {
          logger.warn(`[ProductService.create] Error consumiendo imagen "${imagesToConsume[i]}": ${res.reason}`)
        }
      })
    }

    return created
  }

  async update(id: string, data: UpdateProductDTO): Promise<IProduct> {
    // 1. Captura previa de las imágenes actuales
    const current = await this.repository.getProductById(id)
    const oldPicture = current.picture
    const oldLogo = current.logo

    // 2. Actualizar registro en base de datos
    const updated = await this.repository.updateProduct(id, data)

    // 3. Evaluar cambios de imagen (si la url entrante es la misma que estaba, no se hace nada con imágenes)
    const isSaver = data.saver === true || String(data.saver) === 'true'
    const replaceTasks: Promise<void>[] = []

    if (data.picture && data.picture !== oldPicture) {
      replaceTasks.push(this.handleReplacedImage(oldPicture, data.picture, isSaver))
    }

    if (data.logo && data.logo !== oldLogo) {
      replaceTasks.push(this.handleReplacedImage(oldLogo, data.logo, isSaver))
    }

    if (replaceTasks.length > 0) {
      const results = await Promise.allSettled(replaceTasks)
      results.forEach(res => {
        if (res.status === 'rejected') {
          logger.error(`[ProductService.update] Error al reemplazar imagen: ${res.reason}`)
        }
      })
    }

    return updated
  }

  async delete(id: string, saver = false): Promise<string> {
    // 1. Captura previa de todas las URLs asociadas
    const current = await this.repository.getProductById(id)
    const imagesToDelete = [
      current.picture,
      current.logo,
      ...(current.variants?.map(v => v.picture) ?? [])
    ].filter(Boolean) as string[]

    // 2. Borrar producto en la DB
    const message = await this.repository.deleteProduct(id)

    // 3. Gestionar imágenes concurrentemente según saver global
    const isSaver = saver === true || String(saver) === 'true'
    if (imagesToDelete.length > 0) {
      const results = await Promise.allSettled(
        imagesToDelete.map(url => this.handleDeletedImage(url, isSaver))
      )
      results.forEach((res, i) => {
        if (res.status === 'rejected') {
          logger.error(`[ProductService.delete] Error procesando imagen "${imagesToDelete[i]}" (saver=${isSaver}): ${res.reason}`)
        }
      })
    }

    return message
  }

  async getVariant(id: string): Promise<IVariantProduct> {
    return await this.repository.getVariantById(id)
  }

  async getPublicVariant(id: string): Promise<IVariantProduct> {
    return await this.repository.getPublicVariantById(id)
  }

  async createVariant(data: CreateVariantDTO): Promise<IVariantProduct> {
    const created = await this.repository.createVariant(data)
    if (data.picture) {
      const [res] = await Promise.allSettled([this.consumeImage(data.picture)])
      if (res.status === 'rejected') {
        logger.warn(`[ProductService.createVariant] Error consumiendo imagen "${data.picture}": ${res.reason}`)
      }
    }
    return created
  }

  async updateVariant(id: string, data: UpdateVariantDTO): Promise<IVariantProduct> {
    const current = await this.repository.getVariantById(id)
    const oldPicture = current.picture

    const updated = await this.repository.updateVariant(id, data)

    const isSaver = data.saver === true || String(data.saver) === 'true'
    if (data.picture && data.picture !== oldPicture) {
      const [res] = await Promise.allSettled([
        this.handleReplacedImage(oldPicture, data.picture, isSaver)
      ])
      if (res.status === 'rejected') {
        logger.error(`[ProductService.updateVariant] Error reemplazando imagen de variante: ${res.reason}`)
      }
    }

    return updated
  }

  async deleteVariant(id: string, saver = false): Promise<string> {
    const current = await this.repository.getVariantById(id)
    const pictureToDelete = current.picture

    const message = await this.repository.deleteVariant(id)
    const isSaver = saver === true || String(saver) === 'true'
    if (pictureToDelete) {
      const [res] = await Promise.allSettled([
        this.handleDeletedImage(pictureToDelete, isSaver)
      ])
      if (res.status === 'rejected') {
        logger.error(`[ProductService.deleteVariant] Error procesando imagen de variante "${pictureToDelete}" (saver=${isSaver}): ${res.reason}`)
      }
    }

    return message
  }

  // --- Helpers de gestión de imágenes ---

  private async consumeImage(url?: string | null): Promise<void> {
    if (!url) return
    await this.imageDbService.internalRemove(url)
  }

  private async handleReplacedImage(oldUrl?: string | null, newUrl?: string | null, saver?: boolean): Promise<void> {
    if (!newUrl || newUrl === oldUrl) return

    // Se consume la nueva imagen eliminándola de la DB (galería temporal)
    await this.consumeImage(newUrl)

    if (!oldUrl) return

    // Si saver es true, la imagen vieja se preserva en la galería de la DB
    // Si saver es false, la imagen vieja se elimina físicamente de Firebase / Storage
    if (saver === true) {
      await this.imageDbService.save(oldUrl)
    } else {
      await this.deleteOldImage(oldUrl)
    }
  }

  private async handleDeletedImage(url?: string | null, saver?: boolean): Promise<void> {
    if (!url) return

    if (saver === true) {
      await this.imageDbService.save(url)
    } else {
      await this.deleteOldImage(url)
    }
  }
}
