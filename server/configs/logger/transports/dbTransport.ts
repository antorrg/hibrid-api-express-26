import { Writable } from 'node:stream'
import { LoggerServiceDb, loggerServiceDb, LogLevel } from '../LoggerServiceDb.js'
import { UuidHandler } from '../../../shared/utils/UuidHandler.js'

export { LoggerServiceDb, loggerServiceDb }


export function levelToText(level: number): LogLevel {
  if (level >= 60) return LogLevel.FATAL
  if (level >= 50) return LogLevel.ERROR
  if (level >= 40) return LogLevel.WARN
  if (level >= 30) return LogLevel.INFO
  return LogLevel.DEBUG
}

export function dbWritableStream(): Writable {
  return new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      try {
        const log = typeof chunk === 'string' ? JSON.parse(chunk) : chunk
        const levelName = levelToText(log.level ?? 30)

        loggerServiceDb.create({
          id: log.id ?? UuidHandler.createUuid(),
          levelName,
          levelCode: log.level ?? 30,
          message: log.msg ?? log.message ?? '',
          type: log.err?.type ?? log.type ?? 'INFO',
          stack: log.err?.stack ?? log.stack ?? null,
          contexts: log.err?.contexts ?? log.contexts ?? [],
          pid: log.pid ?? process.pid,
          time: log.time ?? Date.now(),
          hostname: log.hostname ?? 'localhost',
          keep: Boolean(log.keep)
        })
          .then(() => callback())
          .catch((err: unknown) => callback(err as Error))
      } catch (err) {
        callback(err as Error)
      }
    }
  })
}
