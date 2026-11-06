import { type HelmetOptions } from 'helmet'
import envConfig from './envConfig.js'

const base: HelmetOptions = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}

export const helmetConfig: HelmetOptions =
  envConfig.Status === 'production'
    ? {
      ...base,
      contentSecurityPolicy: {
        reportOnly: false, // pasalo a false cuando la consola del navegador no muestre violaciones
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'", 'data:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          frameSrc: ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"]
        }
      }
    }
    : { ...base, contentSecurityPolicy: false }