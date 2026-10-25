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
