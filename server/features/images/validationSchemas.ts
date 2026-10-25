import type { Schema } from 'req-valid-express'

export const imageQuery: Schema = {
  page: {
    type: 'int',
    default: 1
  }, 
  limit: {
    type: 'int',
    default: 5
  },
  order: {
    type: 'string',
    default: 'DESC',
    sanitize: {
      trim: true
    }
  }
}