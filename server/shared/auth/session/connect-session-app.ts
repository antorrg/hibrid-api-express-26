import { Store, type SessionData } from 'express-session'
import type { ISessionAdapter, SessionStoreOptions, DefaultFields } from './types.js'

//const debug = createDebug('connect:session')

const defaultOptions = {
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
  disableTouch: false
}

function promisify<T>(promise: Promise<T>, fn?: (err: unknown, data?: T) => void): Promise<T> {
  if (typeof fn === 'function') {
    promise
      .then((result) => fn(null, result))
      .catch((err) => fn(err || new Error('Session store error')))
  }
  return promise
}

export class DbSessionStore extends Store {
  public options: Required<SessionStoreOptions>
  public adapter: ISessionAdapter
  private _expirationInterval: NodeJS.Timeout | null = null

  constructor(options: SessionStoreOptions) {
    super()
    this.options = { ...defaultOptions, ...(options || {}) } as Required<SessionStoreOptions>

    if (!this.options.adapter) {
      throw new Error('adapter (ISessionAdapter) instance is required for DbSessionStore')
    }
    this.adapter = this.options.adapter

    this.startExpiringSessions()
  }


  get(sid: string, fn?: (err: unknown, session?: SessionData | null) => void) {
    //debug('GET "%s"', sid)
    const promise = this.adapter.get(sid).then((record) => {
      if (!record) return null
      return JSON.parse(record.data) as SessionData
    })
    return promisify(promise, fn)
  }

  set(sid: string, data: SessionData, fn?: (err?: unknown, session?: unknown) => void) {
    //debug('SET "%s"', sid)
    const stringData = JSON.stringify(data)
    const expires = this.expiration(data)

    let defaults: DefaultFields = { data: stringData, expires }
    if (this.options.extendDefaultFields) {
      defaults = this.options.extendDefaultFields(defaults, data)
    }

    const promise = this.adapter.set(sid, defaults)
    return promisify(promise, fn)
  }

  touch(sid: string, data: SessionData, fn?: (err?: unknown) => void) {
    //debug('TOUCH "%s"', sid)
    if (this.options.disableTouch) {
      if (typeof fn === 'function') fn()
      return Promise.resolve()
    }
    const expires = this.expiration(data)
    const promise = this.adapter.touch(sid, expires)
    return promisify(promise, fn)
  }

  destroy(sid: string, fn?: (err?: unknown) => void) {
    //debug('DESTROY "%s"', sid)
    const promise = this.adapter.destroy(sid)
    return promisify(promise, fn)
  }

  length(fn?: (err: unknown, count?: number) => void) {
    const promise = this.adapter.length()
    return promisify(promise, fn)
  }

  clearExpiredSessions(fn?: (err?: unknown) => void) {
    //debug('CLEARING EXPIRED SESSIONS')
    const promise = this.adapter.clearExpiredSessions(new Date())
    return promisify(promise, fn)
  }

  startExpiringSessions() {
    this.stopExpiringSessions()
    if (this.options.checkExpirationInterval > 0) {
      this._expirationInterval = setInterval(
        () => this.clearExpiredSessions(),
        this.options.checkExpirationInterval
      )
      this._expirationInterval.unref()
    }
  }

  stopExpiringSessions() {
    if (this._expirationInterval) {
      clearInterval(this._expirationInterval)
      this._expirationInterval = null
    }
  }

  expiration(data: SessionData): Date {
    if (data.cookie && data.cookie.expires && !isNaN(new Date(data.cookie.expires).getTime())) {
      return new Date(data.cookie.expires)
    }
    return new Date(Date.now() + this.options.expiration)
  }
}
export default DbSessionStore
  