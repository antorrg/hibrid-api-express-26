import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ApiKeyService } from './ApiKeyService.js'
import { ApiKey } from './ApiKey.js'
import type { IApiKeyRepository } from './ApiKey.types.js'

describe('ApiKeyService', () => {
  let mockRepo: IApiKeyRepository
  let service: ApiKeyService

  beforeEach(() => {
    mockRepo = {
      createClientWithKey: vi.fn().mockResolvedValue(undefined),
      findClientByName: vi.fn().mockResolvedValue(null),
      findClientById: vi.fn(),
      getClientsWithKeys: vi.fn(),
      findApiKeyByKeyId: vi.fn(),
      updateClient: vi.fn(),
      updateApiKey: vi.fn(),
      deleteClient: vi.fn().mockResolvedValue('Cliente c-1 borrado exitosamente'),
      deleteApiKey: vi.fn().mockResolvedValue('ApiKey k-1 borrada exitosamente')
    }
    service = new ApiKeyService(mockRepo, true)
    service.clearCache()
  })

  describe('register', () => {
    it('should throw error if client already exists', async() => {
      vi.mocked(mockRepo.findClientByName).mockResolvedValueOnce({
        id: '1',
        name: 'Existing',
        url: 'https://existing.com',
        enabled: true
      })

      await expect(service.register({ name: 'Existing', url: 'https://existing.com' }))
        .rejects.toThrow('Client Existing already exists')
    })

    it('should register client and return name and apiKey', async() => {
      const result = await service.register({ name: 'NewClient', url: 'https://newclient.com' })

      expect(mockRepo.createClientWithKey).toHaveBeenCalledTimes(1)
      expect(result.name).toBe('NewClient')
      expect(result.apiKey).toMatch(/^hbx_/)
    })
  })

  describe('apiKeyVerify', () => {
    it('should reject invalid api key format', async() => {
      await expect(service.apiKeyVerify('invalid-key')).rejects.toThrow('Invalid API Key format')
    })

    it('should throw when apiKey is not found', async() => {
      vi.mocked(mockRepo.findApiKeyByKeyId).mockResolvedValueOnce(null)
      await expect(service.apiKeyVerify('hbx_123456789012_secretval')).rejects.toThrow('Not found')
    })

    it('should throw when client is disabled', async() => {
      const { toClient, toPersistence } = ApiKey.createApiKey('client-1')
      vi.mocked(mockRepo.findApiKeyByKeyId).mockResolvedValueOnce({
        apiKeyId: toPersistence.id,
        keyId: toPersistence.keyId,
        keyHash: toPersistence.keyHash,
        apiKeyEnabled: true,
        clientId: 'client-1',
        clientName: 'Client 1',
        clientUrl: 'https://test.com',
        clientEnabled: false
      })

      await expect(service.apiKeyVerify(toClient)).rejects.toThrow('Access denied')
    })

    it('should verify valid active key and cache result', async() => {
      const { toClient, toPersistence } = ApiKey.createApiKey('client-1')
      vi.mocked(mockRepo.findApiKeyByKeyId).mockResolvedValue({
        apiKeyId: toPersistence.id,
        keyId: toPersistence.keyId,
        keyHash: toPersistence.keyHash,
        apiKeyEnabled: true,
        clientId: 'client-1',
        clientName: 'Client 1',
        clientUrl: 'https://test.com',
        clientEnabled: true
      })

      const verified = await service.apiKeyVerify(toClient)
      expect(verified.clientName).toBe('Client 1')

      // Second call should hit cache without querying repository again
      const cached = await service.apiKeyVerify(toClient)
      expect(cached.clientName).toBe('Client 1')
      expect(mockRepo.findApiKeyByKeyId).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete operations', () => {
    it('should return confirmation message on clientDelete', async() => {
      const msg = await service.clientDelete('c-1')
      expect(msg).toBe('Cliente c-1 borrado exitosamente')
    })

    it('should return confirmation message on apiKeyDelete', async() => {
      const msg = await service.apiKeyDelete('k-1')
      expect(msg).toBe('ApiKey k-1 borrada exitosamente')
    })
  })
})
