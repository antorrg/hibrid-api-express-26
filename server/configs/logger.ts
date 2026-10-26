import pino, { type Logger as PinoLogger } from 'pino'
import envConfig from './envConfig.js'
import { fileTransport, customFileTransport } from './logger/transports/fileTransport.js'
import { dbWritableStream } from './logger/transports/dbTransport.js'

let logger: PinoLogger


switch (envConfig.Status) {
case 'test':
  // Pretty print en consola, simple
  logger = pino({
    level: 'info',
    transport: customFileTransport('', true)
  })
  break

case 'development': // dev
  // Guardar logs en archivo
  logger = pino({
    level: 'info',
    transport: fileTransport()
  })
  break

case 'production':
  // Guardar logs en la base de datos usando Sequelize
  logger = pino(
    {
      level: 'warn'
    },
    dbWritableStream() // stream personalizado
  )
  break

default:
  logger = pino()
}

export default logger
