import type { Schema } from 'req-valid-express'

export const emailSchema : Schema = {
  email: {
    type: 'string',
    sanitize: {
      trim: true,
      lowercase:true
    }
  },
  subject: {
    type: 'string',
    sanitize:{
      trim:true
    }
  },
  message: {
    type: 'string',
    sanitize:{
      trim:true
    }
  }
}