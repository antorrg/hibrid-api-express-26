import session from 'express-session'
import sessionAdapter from './session/connect-db.js'
import DbSessionStore from './session/connect-session-app.js'
import envConfig from '../../configs/envConfig.js'



const store = envConfig.Status === 'test'
  ? new session.MemoryStore()
  : new DbSessionStore({
    adapter: sessionAdapter
  })


export const sessionMiddleware = session({
  name: 'app.sid',
  secret: envConfig.SessionSecret,
  store,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: envConfig.Status === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 30 // 30m
  }
})