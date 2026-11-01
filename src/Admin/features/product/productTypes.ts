export interface IVariantProduct {
  id: string;
  productId: string;
  picture: string;
  text: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProduct {
  id: string;
  title: string;
  picture: string;
  logo: string;
  info_header: string;
  info_body: string | null;
  isAlive: boolean;
  url: string;
  enabled: boolean;
  variants?: IVariantProduct[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductSummary {
  id: string;
  title: string;
  picture: string;
  logo: string;
  info_header: string;
  info_body: string | null;
  isAlive: boolean;
  url: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVariantInProductDTO {
  picture: string;
  text: string;
}

export interface CreateProductDTO {
  title: string;
  picture: string;
  logo: string;
  info_header: string;
  info_body?: string | null;
  isAlive?: boolean;
  url?: string;
  variants?: CreateVariantInProductDTO[];
  items?: CreateVariantInProductDTO[];
}

export interface UpdateProductDTO {
  title?: string;
  picture?: string;
  logo?: string;
  info_header?: string;
  info_body?: string | null;
  isAlive?: boolean;
  url?: string;
  enabled?: boolean;
  saver?: boolean;
}

export interface CreateVariantDTO {
  productId: string;
  picture: string;
  text: string;
}

export interface UpdateVariantDTO {
  picture?: string;
  text?: string;
  enabled?: boolean;
  saver?: boolean;
}
