import type { CorsOptions } from 'cors'
import envConfig from './envConfig.js'

const allowedOrigins = [
  'https://nomadests2026-production.up.railway.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://localhost:4173',
  'http://127.0.0.1:4000',
  'http://localhost:4000'
]

if (envConfig.BaseUrl) {
  try {
    const parsed = new URL(envConfig.BaseUrl)
    if (!allowedOrigins.includes(parsed.origin)) {
      allowedOrigins.push(parsed.origin)
    }
  } catch {
    if (!allowedOrigins.includes(envConfig.BaseUrl)) {
      allowedOrigins.push(envConfig.BaseUrl)
    }
  }
}

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Permite requests sin origin (ej: Postman / Thunder / mismo servidor)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true)
    } else {
      callback(new Error('CORS: Origin no permitido'), false)
    }
  },
  credentials: true, // <- NECESARIO para cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-TOKEN']
}

