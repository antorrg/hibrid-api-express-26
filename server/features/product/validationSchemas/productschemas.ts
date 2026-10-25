import type { Schema } from 'req-valid-express'

export const create: Schema = {
  title: {
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
  logo: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  info_header: {
    type: 'string',
    sanitize: {
      trim: true,
      escape: true
    }
  },
  info_body: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true,
      escape: true
    }
  },
  isAlive: {
    type: 'boolean',
    optional: true
  },
  url: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true
    }
  },
  variants: [{
    picture: { type: 'string' },
    text: { type: 'string' }
  }],
  items: [{
    picture: { type: 'string' },
    text: { type: 'string' }
  }]
}

export const update: Schema = {
  title: {
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
  logo: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true
    }
  },
  info_header: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true,
      escape: true
    }
  },
  info_body: {
    type: 'string',
    optional: true,
    sanitize: {
      trim: true,
      escape: true
    }
  },
  isAlive: {
    type: 'boolean',
    optional: true
  },
  url: {
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
  create,
  update
}
