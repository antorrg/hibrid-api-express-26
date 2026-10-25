import type { Model } from 'sequelize'
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

export type {
  IProduct,
  IProductSummary,
  IVariantProduct,
  CreateProductDTO,
  UpdateProductDTO,
  CreateVariantDTO,
  UpdateVariantDTO,
  IProductRepository
}

// Aliases for compatibility
export type IVariant = IVariantProduct
export type IItem = IVariantProduct
export type CreateProduct = CreateProductDTO
export type UpdateProduct = UpdateProductDTO
export type CreateVariant = CreateVariantDTO
export type CreateItem = CreateVariantDTO
export type UpdateVariant = UpdateVariantDTO
export type UpdateItem = UpdateVariantDTO
export type ProductsResponse = IProductSummary

type Parseable<T> = T | Model

interface RawVariant {
  id: string
  productId?: string
  ProductId?: string
  picture: string
  text: string
  enabled?: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface RawProduct {
  id: string
  title: string
  picture: string
  logo: string
  info_header: string
  info_body?: string | null
  isAlive?: boolean
  url?: string
  enabled?: boolean
  variants?: RawVariant[]
  Variants?: RawVariant[]
  createdAt?: Date
  updatedAt?: Date
}

const isSequelizeModel = (value: unknown): value is Model => (
  typeof value === 'object' &&
  value !== null &&
  'get' in value &&
  typeof (value as { get: unknown }).get === 'function'
)

const toRaw = <T>(value: Parseable<T>): T => {
  if (isSequelizeModel(value)) {
    return value.get({ plain: true }) as T
  }
  return value as T
}

export class VariantParser {
  static toDTO(rawInput: Parseable<RawVariant>): IVariantProduct {
    const raw = toRaw<RawVariant>(rawInput)
    return {
      id: raw.id,
      productId: raw.productId ?? raw.ProductId ?? '',
      picture: raw.picture,
      text: raw.text,
      enabled: raw.enabled ?? true,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }
  }
}

export class ProductParser {
  static toDetailDTO(rawInput: Parseable<RawProduct>): IProduct {
    const raw = toRaw<RawProduct>(rawInput)
    const variantsRaw = raw.variants || raw.Variants || []
    return {
      id: raw.id,
      title: raw.title,
      picture: raw.picture,
      logo: raw.logo,
      info_header: raw.info_header,
      info_body: raw.info_body ?? null,
      isAlive: raw.isAlive ?? false,
      url: raw.url ?? 'NoUrl',
      enabled: raw.enabled ?? true,
      variants: Array.isArray(variantsRaw) ? variantsRaw.map(v => VariantParser.toDTO(v)) : undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }
  }

  static toSummaryDTO(rawInput: Parseable<RawProduct>): IProductSummary {
    const raw = toRaw<RawProduct>(rawInput)
    return {
      id: raw.id,
      title: raw.title,
      picture: raw.picture,
      logo: raw.logo,
      info_header: raw.info_header,
      info_body: raw.info_body ?? null,
      isAlive: raw.isAlive ?? false,
      url: raw.url ?? 'NoUrl',
      enabled: raw.enabled ?? true,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }
  }
}
