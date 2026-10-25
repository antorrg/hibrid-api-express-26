import type {
  IApiKey,
  IClient,
  IClientRecord,
  IApiKeyRepository,
  PaginatedClients,
  UpdateClientDTO,
  UpdateApiKeyDTO,
  ApiKeyPersistenceData
} from './ApiKey.types.js'
import { Client as ClientDbModel, ApiKey as ApiKeyDbModel, sequelize } from '../../configs/database.js'
import type { CreationAttributes } from 'sequelize'
import type { Client as ClientDb } from '../../models/client.model.js'
import type { ApiKey as ApiKeyDb } from '../../models/apiKey.model.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import { clientParsed } from './helpers.js'

export class ApiKeyRepository implements IApiKeyRepository {
  constructor(
    private readonly clientModel: typeof ClientDbModel = ClientDbModel,
    private readonly apiKeyModel: typeof ApiKeyDbModel = ApiKeyDbModel
  ) {}

  async createClientWithKey(
    clientData: { id: string, name: string, url: string },
    keyData: ApiKeyPersistenceData
  ): Promise<void> {
    const t = await sequelize.transaction()
    try {
      const client = await this.clientModel.create(clientData as unknown as CreationAttributes<ClientDb>, { transaction: t })
      await this.apiKeyModel.create({
        ...keyData,
        clientId: client.id
      } as unknown as CreationAttributes<ApiKeyDb>, { transaction: t })
      await t.commit()
    } catch (error) {
      await t.rollback()
      throw error
    }
  }

  async findClientByName(name: string): Promise<IClient | null> {
    const client = await this.clientModel.findOne({ where: { name } })
    return client ? (client.toJSON() as IClient) : null
  }

  async findClientById(id: string): Promise<IClientRecord | null> {
    const client = await this.clientModel.findByPk(id, {
      include: [
        {
          model: this.apiKeyModel,
          attributes: ['id', 'keyId', 'enabled']
        }
      ]
    })
    return client ? clientParsed(client) : null
  }

  async getClientsWithKeys(page: number, limit: number): Promise<PaginatedClients> {
    const offset = (page - 1) * limit
    const { count, rows } = await this.clientModel.findAndCountAll({
      include: [
        {
          model: this.apiKeyModel,
          attributes: ['id', 'keyId', 'enabled']
        }
      ],
      offset,
      limit,
      distinct: true,
      order: [['createdAt', 'DESC']]
    })
    const totalPages = Math.ceil(count / limit) || 1

    return {
      info: {
        currentPage: page,
        totalPages,
        totalElements: count
      },
      data: rows.map(r => clientParsed(r))
    }
  }

  async findApiKeyByKeyId(keyId: string): Promise<{
    apiKeyId: string
    keyId: string
    keyHash: string
    apiKeyEnabled: boolean
    clientId: string
    clientName: string
    clientUrl: string
    clientEnabled: boolean
  } | null> {
    const apiKey = await this.apiKeyModel.findOne({ where: { keyId } })
    if (!apiKey) return null

    const clientId = (apiKey as unknown as ApiKeyDb).clientId
    if (!clientId) return null

    const client = await this.clientModel.findByPk(clientId)
    if (!client) return null

    const clientTyped = client as unknown as ClientDb
    const apiKeyTyped = apiKey as unknown as ApiKeyDb

    return {
      apiKeyId: apiKeyTyped.id,
      keyId: apiKeyTyped.keyId,
      keyHash: apiKeyTyped.keyHash,
      apiKeyEnabled: apiKeyTyped.enabled,
      clientId: clientTyped.id,
      clientName: clientTyped.name,
      clientUrl: clientTyped.url,
      clientEnabled: clientTyped.enabled
    }
  }

  async updateClient(id: string, data: UpdateClientDTO): Promise<IClient> {
    const client = await this.clientModel.findByPk(id)
    if (!client) {
      throwError(ERROR_CODE.NOT_FOUND, `Cliente con ID ${id} no encontrado`)
    }
    await client.update(data as unknown as Parameters<typeof client.update>[0])
    return client.toJSON() as IClient
  }

  async updateApiKey(id: string, data: UpdateApiKeyDTO): Promise<IApiKey> {
    const apiKey = await this.apiKeyModel.findByPk(id)
    if (!apiKey) {
      throwError(ERROR_CODE.NOT_FOUND, `Registro ID ${id} no encontrado`)
    }
    await apiKey.update(data as unknown as Parameters<typeof apiKey.update>[0])
    return apiKey.toJSON() as IApiKey
  }

  async deleteClient(id: string): Promise<string> {
    const client = await this.clientModel.findByPk(id)
    if (!client) {
      throwError(ERROR_CODE.NOT_FOUND, `Cliente con ID ${id} no encontrado`)
    }
    await client.destroy()
    return `Cliente ${id} borrado exitosamente`
  }

  async deleteApiKey(id: string): Promise<string> {
    const apiKey = await this.apiKeyModel.findByPk(id)
    if (!apiKey) {
      throwError(ERROR_CODE.NOT_FOUND, `Registro ID ${id} no encontrado`)
    }
    await apiKey.destroy()
    return `ApiKey ${id} borrada exitosamente`
  }
}
