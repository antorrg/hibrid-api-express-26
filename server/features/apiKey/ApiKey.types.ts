export interface IApiKey {
  id: string
  clientId: string
  keyId: string
  keyHash: string
  enabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IClient {
  id: string
  name: string
  url: string
  enabled: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface IApiKeySummary {
  apiKeyId: string
  keyId: string
  apiKeyEnabled: boolean
}

export interface IClientRecord {
  clientId: string
  clientName: string
  clientUrl: string
  clientEnabled: boolean
  keys: IApiKeySummary[]
}

export interface IApiKeyVerification {
  apiKeyId: string
  keyId: string
  clientId: string
  clientName: string
  clientUrl: string
}

export interface CreateClientDTO {
  name: string
  url: string
}

export interface UpdateClientDTO {
  name?: string
  url?: string
  enabled?: boolean
}

export interface UpdateApiKeyDTO {
  enabled: boolean
}

export interface ClientQueries {
  page?: number | string
  limit?: number | string
}

export interface PaginatedClients {
  info: {
    currentPage: number
    totalPages: number
    totalElements: number
  }
  data: IClientRecord[]
}

export interface ApiKeyCreatedResult {
  name: string
  apiKey: string
}

export interface ApiKeyPersistenceData {
  id: string
  clientId: string
  keyId: string
  keyHash: string
}

export interface IApiKeyRepository {
  createClientWithKey(
    clientData: { id: string, name: string, url: string },
    keyData: ApiKeyPersistenceData
  ): Promise<void>
  findClientByName(name: string): Promise<IClient | null>
  findClientById(id: string): Promise<IClientRecord | null>
  getClientsWithKeys(page: number, limit: number): Promise<PaginatedClients>
  findApiKeyByKeyId(keyId: string): Promise<{
    apiKeyId: string
    keyId: string
    keyHash: string
    apiKeyEnabled: boolean
    clientId: string
    clientName: string
    clientUrl: string
    clientEnabled: boolean
  } | null>
  updateClient(id: string, data: UpdateClientDTO): Promise<IClient>
  updateApiKey(id: string, data: UpdateApiKeyDTO): Promise<IApiKey>
  deleteClient(id: string): Promise<string>
  deleteApiKey(id: string): Promise<string>
}
