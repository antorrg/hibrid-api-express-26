import NodeCache from 'node-cache'
import { ApiKey } from './ApiKey.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'
import type {
  IApiKey,
  IClient,
  IClientRecord,
  IApiKeyVerification,
  CreateClientDTO,
  UpdateClientDTO,
  UpdateApiKeyDTO,
  ClientQueries,
  PaginatedClients,
  ApiKeyCreatedResult,
  IApiKeyRepository
} from './ApiKey.types.js'

const apiKeyCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  maxKeys: 100,
  useClones: false
})

export class ApiKeyService {
  constructor(
    private readonly repository: IApiKeyRepository,
    private readonly useCache: boolean = false
  ) {}

  clearCache(): void {
    apiKeyCache.flushAll()
  }

  async register(data: CreateClientDTO): Promise<ApiKeyCreatedResult> {
    const exists = await this.repository.findClientByName(data.name)
    if (exists) {
      throwError(ERROR_CODE.DUPLICATE_VALUE, `Client ${data.name} already exists`)
    }

    const clientId = UuidHandler.createUuid()
    const { toClient, toPersistence } = ApiKey.createApiKey(clientId)

    await this.repository.createClientWithKey(
      {
        id: clientId,
        name: data.name,
        url: data.url
      },
      toPersistence
    )

    return {
      name: data.name,
      apiKey: toClient
    }
  }

  async apiKeyVerify(key: unknown): Promise<IApiKeyVerification> {
    const parsed = ApiKey.parse(key)
    if (!parsed) {
      throwError(ERROR_CODE.INVALID_INPUT, 'Invalid API Key format')
    }

    const { keyId, secret } = parsed!
    let response: Awaited<ReturnType<IApiKeyRepository['findApiKeyByKeyId']>> = null

    if (this.useCache) {
      response = apiKeyCache.get(keyId) ?? null
    }

    if (!response) {
      response = await this.repository.findApiKeyByKeyId(keyId)

      if (!response) {
        throwError(ERROR_CODE.NOT_FOUND, 'Not found')
      }

      if (this.useCache && response) {
        apiKeyCache.set(keyId, response)
      }
    }

    if (
      response!.clientEnabled === false ||
      response!.apiKeyEnabled === false
    ) {
      throwError(ERROR_CODE.UNAUTHORIZED, 'Access denied')
    }

    const keyMatch = ApiKey.verify(secret, response!.keyHash)
    if (!keyMatch) {
      throwError(ERROR_CODE.UNAUTHORIZED, 'Access denied')
    }

    return {
      apiKeyId: response!.apiKeyId,
      keyId: response!.keyId,
      clientId: response!.clientId,
      clientName: response!.clientName,
      clientUrl: response!.clientUrl
    }
  }

  async getAllClients(options: ClientQueries = {}): Promise<PaginatedClients> {
    const page = Number(options.page) || 1
    const limit = Number(options.limit) || 10
    return await this.repository.getClientsWithKeys(page, limit)
  }

  async getClientById(clientId: string): Promise<IClientRecord> {
    const client = await this.repository.findClientById(clientId)
    if (!client) {
      throwError(ERROR_CODE.NOT_FOUND, `Cliente con ID ${clientId} no encontrado`)
    }
    return client
  }

  async clientUpdate(id: string, data: UpdateClientDTO): Promise<IClient> {
    const response = await this.repository.updateClient(id, data)
    if (this.useCache) {
      this.clearCache()
    }
    return response
  }

  async clientDelete(id: string): Promise<string> {
    const response = await this.repository.deleteClient(id)
    if (this.useCache) {
      this.clearCache()
    }
    return response
  }

  async apiKeyEnabledDisabled(id: string, data: UpdateApiKeyDTO): Promise<IApiKey> {
    const response = await this.repository.updateApiKey(id, data)
    if (this.useCache) {
      this.clearCache()
    }
    return response
  }

  async apiKeyDelete(id: string): Promise<string> {
    const response = await this.repository.deleteApiKey(id)
    if (this.useCache) {
      this.clearCache()
    }
    return response
  }
}
