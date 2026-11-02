import type { Schema } from 'req-valid-express'
import envConfig from '../../configs/envConfig.js'

export const createAbout: Schema = {
  title: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  text: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  picture: {
    type: 'string',
    default: envConfig.UserImg
  },
  imgShow: {
    type: 'boolean'
  }
}

export const updateAbout: Schema = {
  title: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  text: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  picture: {
    type: 'string'
  },
  imgShow: {
    type: 'boolean'
  },
  enabled: {
    type: 'boolean'
  }
}


