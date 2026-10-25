export interface IVariantProduct {
  id: string
  productId: string
  picture: string
  text: string
  enabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IProduct {
  id: string
  title: string
  picture: string
  logo: string
  info_header: string
  info_body: string | null
  isAlive: boolean
  url: string
  enabled: boolean
  variants?: IVariantProduct[]
  createdAt?: Date
  updatedAt?: Date
}

export interface IProductSummary {
  id: string
  title: string
  picture: string
  logo: string
  info_header: string
  info_body: string | null
  isAlive: boolean
  url: string
  enabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateVariantInProductDTO {
  picture: string
  text: string
}

export interface CreateProductDTO {
  title: string
  picture: string
  logo: string
  info_header: string
  info_body?: string | null
  isAlive?: boolean
  url?: string
  variants?: CreateVariantInProductDTO[]
  items?: CreateVariantInProductDTO[]
}

export interface UpdateProductDTO {
  title?: string
  picture?: string
  logo?: string
  info_header?: string
  info_body?: string | null
  isAlive?: boolean
  url?: string
  enabled?: boolean
  saver?: boolean
}

export interface CreateVariantDTO {
  productId: string
  picture: string
  text: string
  ProductId?: string
}

export interface UpdateVariantDTO {
  picture?: string
  text?: string
  enabled?: boolean
  saver?: boolean
}

export interface IProductRepository {
  getAllProducts(): Promise<IProductSummary[]>
  getPublicProducts(): Promise<IProductSummary[]>
  getProductById(id: string): Promise<IProduct>
  getPublicProductById(id: string): Promise<IProduct>
  createProduct(data: CreateProductDTO): Promise<IProduct>
  updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct>
  deleteProduct(id: string): Promise<string>

  getVariantById(id: string): Promise<IVariantProduct>
  getPublicVariantById(id: string): Promise<IVariantProduct>
  createVariant(data: CreateVariantDTO): Promise<IVariantProduct>
  updateVariant(id: string, data: UpdateVariantDTO): Promise<IVariantProduct>
  deleteVariant(id: string): Promise<string>
}
