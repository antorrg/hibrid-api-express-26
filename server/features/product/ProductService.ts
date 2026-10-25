import type {
  IProduct,
  IProductSummary,
  IVariantProduct,
  IProductPublicSummary,
  IProductPublicDetail,
  IVariantSinglePublic,
  CreateProductDTO,
  UpdateProductDTO,
  CreateVariantDTO,
  UpdateVariantDTO,
  ProductCreationAttributes,
  VariantCreationAttributes,
  IProductRepository
} from './Product.types.js'
import type { ImageDbService } from '../images/ImageDbService.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import logger from '../../configs/logger.js'

export class ProductService {
  constructor(
    private readonly repository: IProductRepository,
    private readonly imageDbService: ImageDbService
  ) {}

  async getAll(): Promise<IProductSummary[]> {
    return await this.repository.getAllProducts()
  }

  async getPublicAll(): Promise<IProductPublicSummary[]> {
    return await this.repository.getPublicProducts()
  }

  async getById(id: string): Promise<IProduct> {
    return await this.repository.getProductById(id)
  }

  async getPublicById(id: string): Promise<IProductPublicDetail> {
    return await this.repository.getPublicProductById(id)
  }

  async create(data: CreateProductDTO): Promise<IProduct> {
    const productId = UuidHandler.createUuid()
    const variantsRaw = data.variants ?? data.items ?? []

    const variantsPayload: VariantCreationAttributes[] = variantsRaw.map(v => ({
      id: UuidHandler.createUuid(),
      productId,
      picture: v.picture,
      text: v.text,
      enabled: true
    }))

    const productPayload: ProductCreationAttributes = {
      id: productId,
      title: data.title,
      picture: data.picture,
      logo: data.logo,
      info_header: data.info_header,
      info_body: data.info_body ?? null,
      isAlive: data.isAlive ?? false,
      url: data.url ?? 'NoUrl',
      enabled: true,
      variants: variantsPayload
    }

    const created = await this.repository.createProduct(productPayload)

    // Al ingresar imágenes (ya existen en storage y db), se consumen borrándolas de la DB
    const imagesToConsume = [
      data.picture,
      data.logo,
      ...(data.variants ?? data.items ?? []).map(v => v.picture)
    ].filter(Boolean) as string[]

    if (imagesToConsume.length > 0) {
      const results = await Promise.allSettled(
        imagesToConsume.map(url => this.imageDbService.consumeImage(url))
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
      replaceTasks.push(this.imageDbService.handleReplacedImage(oldPicture, data.picture, isSaver))
    }

    if (data.logo && data.logo !== oldLogo) {
      replaceTasks.push(this.imageDbService.handleReplacedImage(oldLogo, data.logo, isSaver))
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
        imagesToDelete.map(url => this.imageDbService.handleDeletedImage(url, isSaver))
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

  async getPublicVariant(id: string): Promise<IVariantSinglePublic> {
    return await this.repository.getPublicVariantById(id)
  }

  async createVariant(data: CreateVariantDTO): Promise<IVariantProduct> {
    const variantPayload: VariantCreationAttributes = {
      id: UuidHandler.createUuid(),
      productId: data.productId,
      picture: data.picture,
      text: data.text,
      enabled: true
    }

    const created = await this.repository.createVariant(variantPayload)
    if (data.picture) {
      const [res] = await Promise.allSettled([this.imageDbService.consumeImage(data.picture)])
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
        this.imageDbService.handleReplacedImage(oldPicture, data.picture, isSaver)
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
        this.imageDbService.handleDeletedImage(pictureToDelete, isSaver)
      ])
      if (res.status === 'rejected') {
        logger.error(`[ProductService.deleteVariant] Error procesando imagen de variante "${pictureToDelete}" (saver=${isSaver}): ${res.reason}`)
      }
    }

    return message
  }
}

