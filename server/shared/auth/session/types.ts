import type { SessionData } from 'express-session'

export interface DefaultFields {
  data: string;
  expires: Date;
  [key: string]: unknown;
}

export interface ISessionAdapter {
  get(sid: string): Promise<{ sid: string; expires: Date; data: string; [key: string]: unknown } | null>;
  set(sid: string, defaults: DefaultFields): Promise<void>;
  touch(sid: string, expires: Date): Promise<void>;
  destroy(sid: string): Promise<void>;
  length(): Promise<number>;
  clearExpiredSessions(now?: Date): Promise<void>;
}

export interface SessionStoreOptions {
  adapter: ISessionAdapter;
  checkExpirationInterval?: number;
  expiration?: number;
  disableTouch?: boolean;
  extendDefaultFields?: (defaults: DefaultFields, session: SessionData) => DefaultFields;
}
