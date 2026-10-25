import { Product as ProductDbModel, VariantProduct as VariantProductDbModel, sequelize } from '../../configs/database.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { ProductParser, VariantParser } from './ProductMappers.js'
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

export class ProductRepository implements IProductRepository {
  constructor(
    private readonly productModel: typeof ProductDbModel = ProductDbModel,
    private readonly variantModel: typeof VariantProductDbModel = VariantProductDbModel
  ) {}

  async getAllProducts(): Promise<IProductSummary[]> {
    const products = await this.productModel.findAll({
      order: [['createdAt', 'DESC']]
    })
    return products.map(p => ProductParser.toSummaryDTO(p))
  }

  async getPublicProducts(): Promise<IProductSummary[]> {
    const products = await this.productModel.findAll({
      where: { enabled: true },
      order: [['createdAt', 'DESC']]
    })
    return products.map(p => ProductParser.toSummaryDTO(p))
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.productModel.findByPk(id, {
      include: [{ model: this.variantModel, as: 'variants' }]
    })
    if (!product) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${id} no encontrado`)
    }
    return ProductParser.toDetailDTO(product)
  }

  async getPublicProductById(id: string): Promise<IProduct> {
    const product = await this.productModel.findOne({
      where: { id, enabled: true },
      include: [
        {
          model: this.variantModel,
          as: 'variants',
          where: { enabled: true },
          required: false
        }
      ]
    })
    if (!product) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${id} no encontrado`)
    }
    return ProductParser.toDetailDTO(product)
  }

  async createProduct(data: CreateProductDTO): Promise<IProduct> {
    const t = await sequelize.transaction()
    try {
      const productId = UuidHandler.createUuid()
      const product = await this.productModel.create(
        {
          id: productId,
          title: data.title,
          picture: data.picture,
          logo: data.logo,
          info_header: data.info_header,
          info_body: data.info_body ?? null,
          isAlive: data.isAlive ?? false,
          url: data.url ?? 'NoUrl',
          enabled: true
        } as any,
        { transaction: t }
      )

      const variantsList = data.variants ?? data.items ?? []
      if (variantsList.length > 0) {
        for (const variant of variantsList) {
          await this.variantModel.create(
            {
              id: UuidHandler.createUuid(),
              productId,
              picture: variant.picture,
              text: variant.text,
              enabled: true
            } as any,
            { transaction: t }
          )
        }
      }

      await t.commit()

      const created = await this.productModel.findByPk(product.id, {
        include: [{ model: this.variantModel, as: 'variants' }]
      })
      return ProductParser.toDetailDTO(created!)
    } catch (error) {
      await t.rollback()
      throw error
    }
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct> {
    const product = await this.productModel.findByPk(id)
    if (!product) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${id} no encontrado`)
    }

    const updateFields = { ...data }
    delete updateFields.saver
    await product.update(updateFields as any)

    const updated = await this.productModel.findByPk(id, {
      include: [{ model: this.variantModel, as: 'variants' }]
    })
    return ProductParser.toDetailDTO(updated!)
  }

  async deleteProduct(id: string): Promise<string> {
    const product = await this.productModel.findByPk(id)
    if (!product) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${id} no encontrado`)
    }
    await product.destroy()
    return `Producto ${id} eliminado exitosamente`
  }

  async getVariantById(id: string): Promise<IVariantProduct> {
    const variant = await this.variantModel.findByPk(id)
    if (!variant) {
      throwError(ERROR_CODE.NOT_FOUND, `Variante con ID ${id} no encontrada`)
    }
    return VariantParser.toDTO(variant)
  }

  async getPublicVariantById(id: string): Promise<IVariantProduct> {
    const variant = await this.variantModel.findOne({
      where: { id, enabled: true }
    })
    if (!variant) {
      throwError(ERROR_CODE.NOT_FOUND, `Variante con ID ${id} no encontrada`)
    }
    return VariantParser.toDTO(variant)
  }

  async createVariant(data: CreateVariantDTO): Promise<IVariantProduct> {
    const productId = data.productId ?? data.ProductId
    if (!productId) {
      throwError(ERROR_CODE.REQUIRED_FIELD_MISSING, 'productId es requerido')
    }

    const productExists = await this.productModel.findByPk(productId)
    if (!productExists) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${productId} no encontrado`)
    }

    const variant = await this.variantModel.create({
      id: UuidHandler.createUuid(),
      productId,
      picture: data.picture,
      text: data.text,
      enabled: true
    } as any)

    return VariantParser.toDTO(variant)
  }

  async updateVariant(id: string, data: UpdateVariantDTO): Promise<IVariantProduct> {
    const variant = await this.variantModel.findByPk(id)
    if (!variant) {
      throwError(ERROR_CODE.NOT_FOUND, `Variante con ID ${id} no encontrada`)
    }

    const updateFields = { ...data }
    delete updateFields.saver
    await variant.update(updateFields as any)
    return VariantParser.toDTO(variant)
  }

  async deleteVariant(id: string): Promise<string> {
    const variant = await this.variantModel.findByPk(id)
    if (!variant) {
      throwError(ERROR_CODE.NOT_FOUND, `Variante con ID ${id} no encontrada`)
    }
    await variant.destroy()
    return `Variante ${id} eliminada exitosamente`
  }
}
