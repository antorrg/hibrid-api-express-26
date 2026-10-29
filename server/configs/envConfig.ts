import dotenv from 'dotenv'

const ENV_FILE = {
  production: '.env',
  development: '.env.development',
  test: '.env.test'
} as const
type Environment = keyof typeof ENV_FILE
const NODE_ENV = (process.env.NODE_ENV as Environment) ?? 'production'

dotenv.config({ path: ENV_FILE[NODE_ENV] })

const redirection = () => {
  switch(process.env.NODE_ENV){
  case 'development':
    return 'http://localhost:5173/'
  case 'preview':
    return '/'
  case 'test':
    return 'http://localhost:5173/'
  case 'production':
    return '/'
  }
}

const getNumberEnv = (value:string):number => {
  const key = process.env[value]
  if (!key) { throw new Error(`La variable de entorno ${value} es requerida`) }
  const parsedEnv = Number(key)
  if (isNaN(parsedEnv)) { throw new Error(`La variable de entorno ${value} debe ser un numero entero`) }
  return parsedEnv
}

const getStringEnv = (value:string):string => {
  const key = process.env[value]
  if (!key) { throw new Error(`La variable de entorno ${value} es requerida`) }
  return key
}
const envConfig = {
  Port: getNumberEnv('PORT'),
  Status: NODE_ENV,
  DatabaseUrl: getStringEnv('DATABASE_URL'),
  UserImg: getStringEnv('USER_IMG'),
  SessionSecret: getStringEnv('SESSION_SECRET'),
  Redirection: redirection,
  // User Owner
  AdminUserEmail: getStringEnv('ADMIN_EMAIL'),
  AdminUserName: getStringEnv('ADMIN_NAME'),
  AdminUserPass: getStringEnv('ADMIN_PASS'),
  // FileStorageService
  BaseTestUrl: getStringEnv('BASE_TEST_URL'),
  //Firebase service:
  FireApiK:getStringEnv('API_KEY'),
  FireAppId: getStringEnv('APP_ID'),
  FirePId: getStringEnv('PROJECT_ID'),
  FireDomain: getStringEnv('AUTH_DOMAIN'),
  FireStoreBuck: getStringEnv('STORAGE_BUCKET'),
  FireMess : getStringEnv('MESSAGIN_SEND_ID'),
  FireMeasure: getStringEnv('MEASUREMENT_ID'),
  // Node-mailer
  GmailUser: getStringEnv('GMAIL_USER'),
  GmailPass: getStringEnv('GMAIL_PASSWORD'),
  // Email:
  WhatsAppNumber: getStringEnv('WHATS_APP_NUMBER'),
  WhatsAppMessage: getStringEnv('WHATS_APP_MESSAGE')
}
export default envConfig
  