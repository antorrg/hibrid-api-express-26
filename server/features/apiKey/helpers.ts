import type { IClientRecord, IApiKeySummary } from './ApiKey.types.js'

interface RawClientInput {
  id: string
  name: string
  url: string
  enabled: boolean
  ApiKeys?: Array<{ id: string, keyId: string, enabled: boolean }>
  ApiKey?: Array<{ id: string, keyId: string, enabled: boolean }>
}

export const clientParsed = (u: unknown): IClientRecord => {
  if (!u) return null as unknown as IClientRecord
  const raw = u as RawClientInput
  const keysList = raw.ApiKeys || raw.ApiKey || []
  return {
    clientId: raw.id,
    clientName: raw.name,
    clientUrl: raw.url,
    clientEnabled: raw.enabled,
    keys: keysList.map((a): IApiKeySummary => ({
      apiKeyId: a.id,
      keyId: a.keyId,
      apiKeyEnabled: a.enabled
    }))
  }
}
