export interface IImage {
  id: string
  imageUrl: string
}

export type ImageQueries = {
  page?: number
  limit?: number
  order?: 'ASC' | 'DESC' | string
}

export type InfoResult = {
  currentPage: number
  pages: number
  total: number
}

export type PagesResult = {
  info: InfoResult
  data: IImage[]
}

export interface IImageRepository {
  save(data: IImage): Promise<void>
  getWithPages(query: ImageQueries): Promise<PagesResult>
  getImage(id: string): Promise<IImage>
  remove(id: string): Promise<string>
  internalRemove(imageUrl: string): Promise<string>
}

export type ImageDeleteFn = (imageUrl: string) => Promise<unknown>

export interface IImageService {
  save(imageUrl: string): Promise<void>
  getWithPages(query: ImageQueries): Promise<PagesResult>
  getImage(id: string): Promise<IImage>
  remove(id: string): Promise<string>
  consumeImage(url?: string | null): Promise<void>
  handleReplacedImage(oldUrl?: string | null, newUrl?: string | null, saver?: boolean | string): Promise<void>
  handleDeletedImage(url?: string | null, saver?: boolean | string): Promise<void>
}
export type IImageDbService = IImageService
