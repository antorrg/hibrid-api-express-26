import type { CorsOptions } from 'cors'
import envConfig from './envConfig.js'

const normalizeOrigin = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).origin
  } catch {
    return rawUrl.trim().replace(/\/+$/, '')
  }
}

const allowedOrigins = [
  'https://hibridapiexpress.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://localhost:4173'
]

if (envConfig.BaseUrl) {
  const baseOrigin = normalizeOrigin(envConfig.BaseUrl)
  if (baseOrigin && !allowedOrigins.includes(baseOrigin)) {
    allowedOrigins.push(baseOrigin)
  }
}

export const sessionCorsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Permite requests sin origin (ej: Postman / Thunder / mismo servidor)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true, // <- NECESARIO para cookies de sesión
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-TOKEN', 'csrf-token']
}

const publicOrigins: string[] = Array.from(
  new Set(
    (envConfig.PublicApiAllowed || [])
      .map(normalizeOrigin)
      .filter(Boolean)
  )
)

export const addPublicOrigin = (origin: string): void => {
  const normalized = normalizeOrigin(origin)
  if (normalized && !publicOrigins.includes(normalized)) {
    publicOrigins.push(normalized)
  }
}

export const getPublicOrigins = (): readonly string[] => publicOrigins

export const publicApiCorsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Permite requests sin origin (ej: Postman / Thunder / mismo servidor)
    if (!origin) return callback(null, true)

    if (publicOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: false, // Clientes externos usan API Keys, no cookies
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'x-api-key']
}