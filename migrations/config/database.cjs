const path = require('path')
const dotenv = require('dotenv')

const environment = process.env.NODE_ENV ?? 'development'

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${environment}`)
})
dotenv.config({
  path: path.resolve(process.cwd(), '.env')
})

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres'
  },

  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres'
  },

  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}
