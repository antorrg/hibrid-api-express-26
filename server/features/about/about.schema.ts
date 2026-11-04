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
    optional: true,
    default: undefined,
    sanitize: {
      trim: true
    }
  },
  text: {
    type: 'string',
    optional: true,
    default: undefined,
    sanitize: {
      trim: true
    }
  },
  picture: {
    type: 'string',
    optional: true,
    default: undefined
  },
  imgShow: {
    type: 'boolean',
    optional: true,
    default: undefined
  },
  enabled: {
    type: 'boolean',
    optional: true,
    default: undefined
  },
  saver: {
    type: 'boolean',
    optional: true,
    default: undefined
  }
}


