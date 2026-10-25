import type { Schema } from 'req-valid-express'

const logquery: Schema = {
  page: {
    type: 'int',
    default: 1
  },
  limit: {
    type: 'int',
    default: 5
  },
  searchField: {
    type: 'string',
    default: 'levelName',
    sanitize: {
      trim: true
    }
  },
  search: {
    type: 'string',
    default: '',
    sanitize: {
      trim: true
    }
  },
  sortBy: {
    type: 'string',
    default: 'id',
    sanitize: {
      trim: true
    }
  },
  order: {
    type: 'string',
    default: 'ASC',
    sanitize: {
      trim: true
    }
  }
}

export default logquery