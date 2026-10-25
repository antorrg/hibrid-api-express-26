import { throwError, processError, ERROR_CODE } from '../errors.js'
import { Op } from 'sequelize'
import { LogLevel, Log } from '../../models/log.model.js'
import {
  type ILogger,
  type LoggerUpdate,
  type ILoggerService,
  type IPagesOptions,
  type IActionResponse,
  type IPaginatedResponse,
  type LoggerCreate
} from './Logger.interfaces.js'

export { LogLevel }

export class LoggerServiceDb implements ILoggerService<ILogger, LoggerUpdate> {
  protected readonly Model: typeof Log

  constructor() {
    this.Model = Log
  }

  /**
   * Parse Log instance → ILogger
   */
  private readonly parserFn = (log: InstanceType<typeof Log>): ILogger => {
    return {
      id: log.id,
      levelName: log.levelName,
      levelCode: log.levelCode,
      message: log.message,
      type: log.type ?? null,
      status: log.status ?? null,
      stack: log.stack ?? null,
      contexts: log.contexts ?? [],
      pid: log.pid,
      time: Number(log.time ?? 0),
      hostname: log.hostname || '',
      keep: log.keep,
      createdAt: log.createdAt ? log.createdAt.toISOString() : undefined,
      updatedAt: log.updatedAt ? log.updatedAt.toISOString() : undefined
    }
  }

  /**
   * Get paginated results
   */
  async getAll(options: IPagesOptions<ILogger> = {}): Promise<IPaginatedResponse> {
    try {
      const {
        searchField = '',
        search = null,
        sortBy = 'id',
        order = 'DESC',
        page = 1,
        limit = 10
      } = options

      const offset = (page - 1) * limit

      const whereClause =
        search && searchField
          ? { [searchField]: { [Op.iLike]: `%${search}%` } }
          : {}

      const { rows: existingRecords, count: total } =
        await this.Model.findAndCountAll({
          limit,
          offset,
          where: whereClause,
          distinct: true,
          order: [[sortBy, order]]
        })

      return {
        info: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        },
        data: existingRecords.map((r: InstanceType<typeof Log>) => this.parserFn(r))
      }
    } catch (error) {
      return processError(error, 'Log getAll')
    }
  }

  /**
   * Get single log by ID
   */
  async getById(id: string): Promise<ILogger> {
    try {
      const record = await this.Model.findByPk(id)

      if (!record) {
        throwError(ERROR_CODE.NOT_FOUND, `Log with ID ${id} not found`)
      }

      return this.parserFn(record!)
    } catch (error) {
      return processError(error, 'Log getById')
    }
  }

  /**
   * Create new log record
   */
  async create(data: LoggerCreate): Promise<ILogger> {
    try {
      const record = await this.Model.create(data)
      return this.parserFn(record)
    } catch (error) {
      return processError(error, 'Log create')
    }
  }

  /**
   * Update keep flag or other allowed fields
   */
  async update(id: string, data: LoggerUpdate): Promise<IActionResponse> {
    try {
      const record = await this.Model.findByPk(id)

      if (!record) {
        throwError(ERROR_CODE.NOT_FOUND, `Log with ID ${id} not found`)
      }

      const updatedRecord = await record.update(data)

      return {
        message: 'Log updated successfully',
        data: this.parserFn(updatedRecord)
      }
    } catch (error) {
      return processError(error, 'Log update')
    }
  }

  /**
   * Delete single log
   */
  async delete(id: string): Promise<string> {
    try {
      const record = await this.Model.findByPk(id)

      if (!record) {
        throwError(ERROR_CODE.NOT_FOUND, `Log with ID ${id} not found`)
      }

      await record.destroy()

      return 'Log deleted successfully'
    } catch (error) {
      return processError(error, 'Log delete')
    }
  }

  /**
   * Delete all logs except those marked as keep = true
   */
  async deleteAll(): Promise<string> {
    try {
      await this.Model.destroy({
        where: {
          keep: false
        }
      })

      return 'Logs deleted successfully'
    } catch (error) {
      return processError(error, 'Log deleteAll')
    }
  }
}

export const loggerServiceDb = new LoggerServiceDb()
  