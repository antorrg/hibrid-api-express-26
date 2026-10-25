import type { Schema } from 'req-valid-express'

export const itemCreate: Schema = {
  text: {
    type: 'string',
    sanitize: {
      trim: true,
      escape: true
    }
  },
  picture: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  productId: {
    type: 'string',
    optional: true
  }
}

export const itemUpdate: Schema = {
  text: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true,
      escape: true
    }
  },
  picture: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true
    }
  },
  enabled: {
    type: 'boolean',
    optional: true
  },
  saver: {
    type: 'boolean',
    optional: true
  }
}

export default {
  itemCreate,
  itemUpdate
}
