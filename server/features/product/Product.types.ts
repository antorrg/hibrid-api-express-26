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

export interface IProductPublicSummary {
  id: string
  title: string
  logo: string
  picture: string
  url: string
  isAlive: boolean
  info_header: string
  info_body: string | null
}

export interface IVariantPublic {
  id: string
  productId: string
  picture: string
  text: string
}

export interface IVariantSinglePublic {
  id: string
  productId: string
  text: string
  picture: string
}


export interface IProductPublicDetail extends IProductPublicSummary {
  variants: IVariantPublic[]
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
}

export interface ProductCreationAttributes {
  id: string
  title: string
  picture: string
  logo: string
  info_header: string
  info_body?: string | null
  isAlive?: boolean
  url?: string
  enabled?: boolean
  variants?: VariantCreationAttributes[]
}

export interface VariantCreationAttributes {
  id: string
  productId: string
  picture: string
  text: string
  enabled?: boolean
}

export interface UpdateVariantDTO {
  picture?: string
  text?: string
  enabled?: boolean
  saver?: boolean
}

export interface IProductRepository {
  getAllProducts(): Promise<IProductSummary[]>
  getPublicProducts(): Promise<IProductPublicSummary[]>
  getProductById(id: string): Promise<IProduct>
  getPublicProductById(id: string): Promise<IProductPublicDetail>
  createProduct(data: ProductCreationAttributes): Promise<IProduct>
  updateProduct(id: string, data: UpdateProductDTO): Promise<IProduct>
  deleteProduct(id: string): Promise<string>

  getVariantById(id: string): Promise<IVariantProduct>
  getPublicVariantById(id: string): Promise<IVariantSinglePublic>
  createVariant(data: VariantCreationAttributes): Promise<IVariantProduct>
  updateVariant(id: string, data: UpdateVariantDTO): Promise<IVariantProduct>
  deleteVariant(id: string): Promise<string>
}


