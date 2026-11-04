import type { Schema } from 'req-valid-express'

const loginSchema: Schema = {
  email: {
    type: 'string',
    sanitize: {
      trim: true,
      lowercase: true
    }
  },
  password: {
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}

export default loginSchema
