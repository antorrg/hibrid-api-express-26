import type { IBaseRepository, IPaginatedOptions, IPaginatedResults } from '../interfaces/base.interface.js'
import { type Model, type ModelStatic, type WhereOptions, type Order, type CreationAttributes, QueryTypes } from 'sequelize'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import { sequelize } from '../../configs/database.js'

export class BaseRepository<
  TDTO,
  TCreate extends object = Record<string, unknown>,
  TUpdate = Partial<TCreate>,
  TModel extends Model = Model
> implements IBaseRepository<TDTO, TCreate, TUpdate> {
  constructor(
    private readonly Model: ModelStatic<TModel>,
    private readonly parserFn: (model: TModel) => TDTO,
    private readonly parserQuery: (model: TModel) =>TDTO,
    private readonly modelName: string = Model.name ?? 'Model',
    private readonly whereField: keyof TDTO & string = 'id' as keyof TDTO & string
  ) {}

  async getAll(
    field?: unknown,
    whereField?: keyof TDTO | string
  ): Promise<TDTO[]> {
    const whereClause = whereField != null && field != null
      ? ({ [whereField]: field } as WhereOptions)
      : ({} as WhereOptions)
    const models = await this.Model.findAll({ where: whereClause })
    return models.map(this.parserFn)
  }

  async getWithPages(
    options?: IPaginatedOptions<TDTO>
  ): Promise<IPaginatedResults<TDTO>> {
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const offset = (page - 1) * limit
    const whereClause = (options?.query ?? {}) as WhereOptions
    const orderClause = options?.order
      ? (Object.entries(options.order).map(([field, direction]) => [field, direction]) as Order)
      : undefined

    const { rows: data, count: total } = await this.Model.findAndCountAll({
      limit,
      offset,
      where: whereClause,
      distinct: true,
      order: orderClause
    })

    return {
      info: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: data.map(this.parserFn)
    }
  }

  async getById(id: string | number): Promise<TDTO> {
    const model = await this.Model.findByPk(id)
    if (!model) throwError(ERROR_CODE.NOT_FOUND, `${this.modelName} not found`)
    return this.parserFn(model)
  }

  async findByField(
    field: unknown,
    whereField: keyof TDTO | string = this.whereField
  ): Promise<TDTO | null> {
    if (field == null) throwError(ERROR_CODE.REQUIRED_FIELD_MISSING, `No value provided for ${(whereField as string)}`)
    const model = await this.Model.findOne({
      where: { [whereField]: field } as WhereOptions
    })
    return model ? this.parserFn(model) : null
  }

  async create(data: TCreate): Promise<TDTO> {
    const model = await this.Model.create(data as unknown as CreationAttributes<TModel>)
    return this.parserFn(model)
  }

  async update(
    id: string | number,
    data: TUpdate
  ): Promise<TDTO> {
    const model = await this.Model.findByPk(id)
    if (!model) throwError(ERROR_CODE.NOT_FOUND, `${this.modelName} not found`)
    const updated = await model.update(data as unknown as Parameters<TModel['update']>[0])
    return this.parserFn(updated)
  }

  async delete(id: string | number): Promise<string> {
    const model = await this.Model.findByPk(id)
    if (!model) throwError(ERROR_CODE.NOT_FOUND, `${this.modelName} not found`)
    const value = model.get(this.whereField) ?? id
    await model.destroy()
    return `${String(value)} deleted successfully`
  }
  //Metodos públicos para renders
  async getAllEnabled(
    field?: unknown,
    whereField?: keyof TDTO | string
  ): Promise<TDTO[]> {
    const tableName = this.#quoteTableName()
    const conditions = ['enabled = true']
    const replacements: Record<string, unknown> = {}

    if (whereField != null && field != null) {
      conditions.push(`${this.#quoteColumn(String(whereField))} = :filter`)
      replacements.filter = field
    }

    const registers = await sequelize.query<TModel>(`
      SELECT *
      FROM ${tableName}
      WHERE ${conditions.join(' AND ')}
      `,
    { replacements, type: QueryTypes.SELECT }
    )

    return registers.map(this.parserQuery)
  }
  async getWithPagesEnabled(
    options?: IPaginatedOptions<TDTO>
  ): Promise<IPaginatedResults<TDTO>> {
    const tableName = this.#quoteTableName()
    const page = options?.page ?? 1
    const limit = options?.limit ?? 10
    const offset = (page - 1) * limit
    const filters = options?.query ?? {}
    const { conditions, replacements } = this.buildEnabledConditions(filters as Record<string, unknown>)
    const orderClause = Object.entries(options?.order ?? {})
      .map(([field, direction]) => {
        const normalizedDirection = direction === 1 || direction === 'ASC'
          ? 'ASC'
          : direction === -1 || direction === 'DESC'
            ? 'DESC'
            : undefined
        if (!normalizedDirection) throw new Error(`Invalid order direction for ${field}`)
        return `${this.#quoteColumn(field)} ${normalizedDirection}`
      })
      .join(', ')
    const whereClause = conditions.join(' AND ')
    const [countResult] = await sequelize.query<{ total: number | string }>(`
      SELECT COUNT(*) AS total
      FROM ${tableName}
      WHERE ${whereClause}
      `,
    { replacements, type: QueryTypes.SELECT }
    )
    const data = await sequelize.query<TModel>(`
      SELECT *
      FROM ${tableName}
      WHERE ${whereClause}
      ${orderClause ? `ORDER BY ${orderClause}` : ''}
      LIMIT :limit
      OFFSET :offset
      `,
    {
      replacements: { ...replacements, limit, offset },
      type: QueryTypes.SELECT
    }
    )
    const total = Number(countResult?.total ?? 0)

    return {
      info: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      data: data.map(this.parserQuery)
    }
  }

  async getByIdEnabled(id: string | number): Promise<TDTO> {
    const tableName = this.#quoteTableName()
    const idColumn = this.#quoteColumn('id')
    const [register] = await sequelize.query<TModel>(`
      SELECT *
      FROM ${tableName}
      WHERE enabled = true
      AND ${idColumn} = :id
      `, {
      replacements: { id },
      type: QueryTypes.SELECT
    })
    if (!register) throwError(ERROR_CODE.NOT_FOUND, `${this.modelName} not found`)
    return this.parserQuery(register)
  }

  private buildEnabledConditions(filters: Record<string, unknown>): {
    conditions: string[]
    replacements: Record<string, unknown>
  } {
    const conditions = ['enabled = true']
    const replacements: Record<string, unknown> = {}

    Object.entries(filters).forEach(([field, value], index) => {
      const column = this.#quoteColumn(field)
      if (value == null) {
        conditions.push(`${column} IS NULL`)
      } else {
        const replacement = `filter${index}`
        conditions.push(`${column} = :${replacement}`)
        replacements[replacement] = value
      }
    })

    return { conditions, replacements }
  }

  #quoteColumn(field: string): string {
    const attribute = this.Model.rawAttributes[field]
    if (!attribute) throw new Error(`Unknown field "${field}" for ${this.modelName}`)
    return this.#quoteIdentifier(attribute.field ?? field)
  }

  #quoteTableName(): string {
    const tableName = this.Model.getTableName()
    if (typeof tableName === 'string') return this.#quoteIdentifier(tableName)
    return [tableName.schema, tableName.tableName]
      .filter((part): part is string => part != null && part.length > 0)
      .map(part => this.#quoteIdentifier(part))
      .join('.')
  }

  #quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`
  }
}