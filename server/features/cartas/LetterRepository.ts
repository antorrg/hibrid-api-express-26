import type { ILetter, ILetterPublic, ILetterRepository, PaginatedLetters } from './Letter.types.js'
import { Letter as LetterModel } from '../../configs/database.js'
import type { Letter as LetterDb } from '../../models/letters.model.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import type { WhereOptions, CreationAttributes } from 'sequelize'

export class LetterRepository implements ILetterRepository {
  constructor(
    private readonly model: typeof LetterModel = LetterModel
  ) {}

  private parser = (record: LetterDb): ILetter => {
    return {
      id: record.id,
      tema: record.tema,
      mensaje: record.mensaje,
      aprobada: record.aprobada,
      createdAt: (record as unknown as { createdAt?: Date }).createdAt,
      updatedAt: (record as unknown as { updatedAt?: Date }).updatedAt
    }
  }

  async create(data: { id: string, tema: string, mensaje: string, aprobada: boolean }): Promise<ILetter> {
    const record = await this.model.create(data as unknown as CreationAttributes<LetterDb>)
    return this.parser(record as unknown as LetterDb)
  }

  async getPublicLetters(page: number, limit: number): Promise<PaginatedLetters<ILetterPublic>> {
    const offset = (page - 1) * limit
    const { rows, count } = await this.model.findAndCountAll({
      where: { aprobada: true },
      attributes: ['id', 'tema', 'mensaje'],
      order: [['id', 'ASC']],
      limit,
      offset,
      distinct: true
    })

    return {
      info: {
        currentPage: page,
        totalPages: Math.ceil(count / limit) || 1,
        totalElements: count
      },
      data: rows.map(r => ({
        id: r.id,
        tema: r.tema,
        mensaje: r.mensaje
      }))
    }
  }

  async getAllAdminLetters(
    page: number,
    limit: number,
    aprobada?: boolean,
    tema?: string
  ): Promise<PaginatedLetters<ILetter>> {
    const offset = (page - 1) * limit
    const where: WhereOptions = {}

    if (aprobada !== undefined) {
      where.aprobada = aprobada
    }

    if (tema && tema !== '' && tema !== 'all') {
      where.tema = tema
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: [['id', 'ASC']],
      limit,
      offset,
      distinct: true
    })

    return {
      info: {
        currentPage: page,
        totalPages: Math.ceil(count / limit) || 1,
        totalElements: count
      },
      data: rows.map(r => this.parser(r as unknown as LetterDb))
    }
  }

  async getById(id: string): Promise<ILetter> {
    const record = await this.model.findByPk(id)
    if (!record) {
      throwError(ERROR_CODE.NOT_FOUND, `Carta con ID ${id} no encontrada`)
    }
    return this.parser(record as unknown as LetterDb)
  }

  async updateModerate(id: string, aprobada: boolean): Promise<ILetter> {
    const record = await this.model.findByPk(id)
    if (!record) {
      throwError(ERROR_CODE.NOT_FOUND, `Carta con ID ${id} no encontrada`)
    }
    await record.update({ aprobada })
    return this.parser(record as unknown as LetterDb)
  }

  async delete(id: string): Promise<string> {
    const record = await this.model.findByPk(id)
    if (!record) {
      throwError(ERROR_CODE.NOT_FOUND, `Carta con ID ${id} no encontrada`)
    }
    await record.destroy()
    return `Carta ${id} eliminada exitosamente`
  }
}
