import type { Schema } from 'req-valid-express'
import { TEMAS_DISPONIBLES } from './helpers.js'

export const createLetter: Schema = {
  tema: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  mensaje: {
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}

export const moderateLetter: Schema = {
  aprobada: {
    type: 'boolean'
  }
}

export const publicQuery: Schema = {
  page: {
    type: 'int',
    default: 1
  },
  limit: {
    type: 'int',
    default: 10
  }
}

export const adminQuery: Schema = {
  page: {
    type: 'int',
    default: 1
  },
  aprobada: {
    type: 'boolean',
    default: true
  },
  limit: {
    type: 'int',
    default: 10
  },
  tema: {
    type: 'string',
    default: ''
  }
}

export default {
  createLetter,
  moderateLetter,
  publicQuery,
  adminQuery,
  TEMAS_DISPONIBLES
}
