import type {
  ILetter,
  ILetterPublic,
  ILetterRepository,
  LetterCreateDTO,
  LetterModerateDTO,
  PaginatedLetters
} from './Letter.types.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { validTema, validAprobada } from './helpers.js'
import logger from '../../configs/logger.js'

export type SendEmailNotificationFn = (to: string, subject: string, message: string) => Promise<void>

export class LetterService {
  constructor(
    private readonly repository: ILetterRepository,
    private readonly sendEmailNotification?: SendEmailNotificationFn
  ) {}

  async createLetter(data: LetterCreateDTO): Promise<ILetter> {
    const tema = validTema(data.tema)
    const newLetterData = {
      id: UuidHandler.createUuid(),
      tema,
      mensaje: data.mensaje,
      aprobada: false
    }

    const created = await this.repository.create(newLetterData)

    if (this.sendEmailNotification) {
      const notificationSubject = 'Nueva carta para revisar'
      const notificationLetter = `Usted tiene una carta para revisar con tema ${created.tema} creada en ${new Date().toISOString()}`

      void this.sendEmailNotification('letters@appmail.com', notificationSubject, notificationLetter)
        .catch(error => {
          logger.error('No se pudo enviar la notificación de la carta', error)
        })
    }

    return created
  }

  async moderateLetter(id: string, data: LetterModerateDTO): Promise<ILetter> {
    const aprobada = validAprobada(data.aprobada)
    return await this.repository.updateModerate(id, aprobada)
  }

  async getAll(page: number = 1, limit: number = 10): Promise<PaginatedLetters<ILetterPublic>> {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10
    return await this.repository.getPublicLetters(pageNum, limitNum)
  }

  async findAllLetters(
    page: number = 1,
    aprobada: unknown = false,
    limit: number = 10,
    tema?: string
  ): Promise<PaginatedLetters<ILetter>> {
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10
    const isAprobada = validAprobada(aprobada)
    return await this.repository.getAllAdminLetters(pageNum, limitNum, isAprobada, tema)
  }

  async getById(id: string): Promise<ILetter> {
    return await this.repository.getById(id)
  }

  async deleteLetter(id: string): Promise<string> {
    return await this.repository.delete(id)
  }
}
