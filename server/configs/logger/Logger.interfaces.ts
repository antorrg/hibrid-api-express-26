import type { LogLevel } from '../../models/log.model.js'
export interface ILogger {
  id?: string
  levelName: LogLevel | string
  levelCode: number
  message: string
  type?: string | null
  status?: number | null
  stack?: string | null
  contexts?: string[]
  pid: number
  time: number
  hostname: string
  keep: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoggerCreate {
  id: string
  levelName: LogLevel
  levelCode: number
  message: string
  type?: string
  stack?: string
  contexts?: string[]
  pid?: number
  time?: number
  hostname?: string
  keep?: boolean
}

export type LoggerUpdate = Partial<Pick<ILogger, 'keep'>>

interface IPagesInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface IPaginatedResponse {
  info: IPagesInfo
  data: ILogger[]
}

export type OrderDirection = 'ASC' | 'DESC' | 'asc' | 'desc'

export interface Order<T> {
  field: keyof T
  direction: OrderDirection
}

export interface IPagesOptions<T> {
  searchField?: keyof T | string
  search?: string | null
  page?: number
  limit?: number
  sortBy?: keyof T | string
  order?: OrderDirection
}

export interface IActionResponse {
  message: string
  data: ILogger
}

export interface ILoggerService<TLog, TLogUpdate> {
  getAll: (options?: IPagesOptions<TLog>) => Promise<IPaginatedResponse>
  getById: (id: string) => Promise<TLog>
  update: (id: string, data: TLogUpdate) => Promise<IActionResponse>
  delete: (id: string) => Promise<string | void>
  deleteAll: () => Promise<string | void>
}
                