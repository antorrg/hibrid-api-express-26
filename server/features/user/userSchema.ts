import type { Schema } from 'req-valid-express'

export const createUser:Schema = {
  email:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  password:{
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}
export const updateProfile:Schema = {
  email:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  name:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  nickname:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  picture: {
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}
export const changePassword:Schema={
  id:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  password:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  newPassword:{
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}
export const upgradeUser:Schema = {
  role:{
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  enabled: {
    type: 'boolean'

  }
}