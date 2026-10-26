export function fileTransport() {
  return {
    target: 'pino-pretty',
    options: {
      colorize: false,
      destination: './logs/app.log',
      mkdir: true
    }
  }
}
export function customFileTransport(fileName: string = 'test', colorize: boolean = false) {
  const session = process.env.TEST_LOG_SESSION || new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const nameSuffix = fileName && fileName.trim() ? fileName.trim() : 'test'
  const FILE_NAME = `${session}-${nameSuffix}`

  return {
    target: 'pino-pretty',
    options: {
      colorize,
      destination: `./logs/${FILE_NAME}.log`,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      mkdir: true
    }
  }
}