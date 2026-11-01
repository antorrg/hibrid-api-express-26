import type { Schema } from 'req-valid-express'

export const videoGroupCreate: Schema = {
  title: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  description: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  productId: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  enabled: {
    type: 'boolean',
    default: true
  },
  videos: [
    {
      name: {
        type: 'string',
        sanitize: {
          trim: true
        }
      },
      youTubeId: {
        type: 'string',
        sanitize: {
          trim: true
        }
      }
    }
  ]
}

export const videoCreate: Schema = {
  videoGroupId: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  name: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  youTubeId: {
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}


export const videoGroupUpdate: Schema = {
  title: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  description: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  enabled: {
    type: 'boolean',
    default: true
  }
}
export const videoUpdate: Schema = {
  videoGroupId: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  name: {
    type: 'string',
    sanitize: {
      trim: true
    }
  },
  youTubeId: {
    type: 'string',
    sanitize: {
      trim: true
    }
  }
}
  
export const vgQuery: Schema = {
  page: {
    type: 'int',
    default: 1
  },
  limit: {
    type: 'int',
    default: 5
  }
}
