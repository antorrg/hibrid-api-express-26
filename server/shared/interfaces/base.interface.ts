
export type Direction = 1 | -1 | 'ASC' | 'DESC'
export interface Order<TDTO> {
  field: keyof TDTO
  direction: Direction
}

export interface IPaginatedOptions<TDTO> {
  query?: Partial<Record<keyof TDTO, unknown>>
  page?: number
  limit?: number
  order?: Partial<Record<keyof TDTO, Direction>>
}

export interface PaginateInfo { total: number, page: number, limit: number, totalPages: number }

export interface IPaginatedResults<TDTO> {
  info: PaginateInfo
  data: TDTO[]
}

export type TUpdate<T> = Partial<Omit<T, 'id'>>
export interface IBaseRepository<TDTO, TCreate, TUpdate> {
  getAll: (field?: unknown, whereField?: keyof TDTO | string) => Promise<TDTO[]>
  getById: (id: string | number) => Promise<TDTO>
  findByField: (field: unknown, whereField?: keyof TDTO | string) => Promise<TDTO | null>
  getWithPages: (options?: IPaginatedOptions<TDTO>) => Promise<IPaginatedResults<TDTO>>
  create: (data: TCreate) => Promise<TDTO>
  update: (id: string | number, data: TUpdate) => Promise<TDTO>
  delete: (id: string | number) => Promise<string>
}
export type UploadedImageFile = Express.Multer.File

export interface IExternalImageDeleteService<T> {
  deleteImage: (imageInfo: T) => Promise<string|undefined>
}
