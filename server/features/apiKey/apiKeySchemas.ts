import type { Schema } from 'req-valid-express'

export const create: Schema = {
  name: {
    type: 'string'
  },
  url: {
    type: 'string'
  }
}

export const updateClient: Schema = {
  name: {
    type: 'string',
    optional: true
  },
  url: {
    type: 'string',
    optional: true
  },
  enabled: {
    type: 'boolean',
    optional: true
  }
}

export const updateKey: Schema = {
  enabled: {
    type: 'boolean'
  }
}

export const query: Schema = {
  page: {
    type: 'int',
    default: 1
  },
  limit: {
    type: 'int',
    default: 10
  }
}

export default {
  create,
  updateClient,
  updateKey,
  query
}
