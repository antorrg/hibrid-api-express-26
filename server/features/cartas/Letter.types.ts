export interface ILetter {
  id: string
  tema: string
  mensaje: string
  aprobada: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ILetterPublic {
  id: string
  tema: string
  mensaje: string
}

export interface LetterCreateDTO {
  tema: string
  mensaje: string
}

export interface LetterModerateDTO {
  aprobada: boolean
}

export interface LetterPublicQueries {
  page?: number | string
  limit?: number | string
}

export interface LetterAdminQueries {
  page?: number | string
  limit?: number | string
  aprobada?: boolean | string
  tema?: string
}

export interface PaginatedLetters<T> {
  info: {
    currentPage: number
    totalPages: number
    totalElements: number
  }
  data: T[]
}

export interface ILetterRepository {
  create(data: { id: string, tema: string, mensaje: string, aprobada: boolean }): Promise<ILetter>
  getPublicLetters(page: number, limit: number): Promise<PaginatedLetters<ILetterPublic>>
  getAllAdminLetters(page: number, limit: number, aprobada?: boolean, tema?: string): Promise<PaginatedLetters<ILetter>>
  getById(id: string): Promise<ILetter>
  updateModerate(id: string, aprobada: boolean): Promise<ILetter>
  delete(id: string): Promise<string>
}
