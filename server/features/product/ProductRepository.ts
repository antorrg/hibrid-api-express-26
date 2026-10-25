import { QueryTypes } from 'sequelize'
import { Product as ProductDbModel, VariantProduct as VariantProductDbModel, sequelize } from '../../configs/database.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import { ProductParser, VariantParser } from './ProductMappers.js'
import type { RawProduct, RawVariant } from './ProductMappers.js'
import type {
  IProduct,
  IProductSummary,
  IVariantProduct,
  IProductPublicSummary,
  IProductPublicDetail,
  IVariantSinglePublic,
  ProductCreationAttributes,
  VariantCreationAttributes,
  UpdateProductDTO,
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

  async getPublicProducts(): Promise<IProductPublicSummary[]> {
    const products = await sequelize.query<RawProduct>(`
      SELECT id, title, logo, picture, url, "isAlive", info_header, info_body
      FROM "${this.productModel.tableName}"
      WHERE enabled = true
      ORDER BY "createdAt" DESC
    `, {
      type: QueryTypes.SELECT
    })
    return products.map(p => ProductParser.toPublicSummaryDTO(p))
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

  async getPublicProductById(id: string): Promise<IProductPublicDetail> {
    const products = await sequelize.query<RawProduct>(`
      SELECT id, title, logo, picture, url, "isAlive", info_header, info_body
      FROM "${this.productModel.tableName}"
      WHERE enabled = true
      AND id = :id
      LIMIT 1
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    })

    if (!products || products.length === 0) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${id} no encontrado`)
    }

    const variants = await sequelize.query<RawVariant>(`
      SELECT id, "productId", picture, text
      FROM "${this.variantModel.tableName}"
      WHERE enabled = true
      AND "productId" = :id
      ORDER BY "createdAt" ASC
    `, {
      replacements: { id },
      type: QueryTypes.SELECT
    })

    return ProductParser.toPublicDetailDTO(products[0], variants)
  }

  async createProduct(data: ProductCreationAttributes): Promise<IProduct> {
    const t = await sequelize.transaction()
    try {
      const product = await this.productModel.create(
       data as any, 
       { transaction: t }
      )

      if (data.variants && data.variants.length > 0) {
        for (const variant of data.variants) {
          await this.variantModel.create(
            variant as any,
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

  async getPublicVariantById(id: string): Promise<IVariantSinglePublic> {
    const variants = await sequelize.query<RawVariant>(`
      SELECT id, "productId", text, picture
      FROM "${this.variantModel.tableName}"
      WHERE enabled = true
      AND id = :id
      LIMIT 1
    `, {

      replacements: { id },
      type: QueryTypes.SELECT
    })

    if (!variants || variants.length === 0) {
      throwError(ERROR_CODE.NOT_FOUND, `Variante con ID ${id} no encontrada`)
    }

    return VariantParser.toPublicSingleDTO(variants[0])
  }

  async createVariant(data: VariantCreationAttributes): Promise<IVariantProduct> {
    const productId = data.productId
    if (!productId) {
      throwError(ERROR_CODE.REQUIRED_FIELD_MISSING, 'productId es requerido')
    }

    const productExists = await this.productModel.findByPk(productId)
    if (!productExists) {
      throwError(ERROR_CODE.NOT_FOUND, `Producto con ID ${productId} no encontrado`)
    }

    const variant = await this.variantModel.create(data as any)

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
