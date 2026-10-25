
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import envConfig from './envConfig.js'
import * as db from './database.js'



describe('EnvDb test', () => { 
  beforeAll(async() => {
    await db.startUp(true, true)
  })
  afterAll(async() => {
    await db.closeDatabase()
  })
  describe('Environment variables', () => {
    it('should return the correct environment status and database variable', () => { 
      const formatEnvInfo = `App running in: ${envConfig.Status}`+
      `Testing database: ${nameOfDb(envConfig.DatabaseUrl)}`
      expect(formatEnvInfo).toBe(
        'App running in: test'+
        'Testing database: hibridapitest'
      )
    })
  })

  describe('Database existence', () => {
    it('should query tables and return an empty array', async() => { 
      const models = [ 
        db.Log.findAll(),
        db.User.findAll(),
        db.Session.findAll(),
        db.FrontPage.findAll(),
        db.Product.findAll(),
        db.VariantProduct.findAll(),
        db.VideoGroup.findAll(),
        db.Video.findAll(),
        db.Image.findAll(),
        db.Client.findAll(), 
        db.ApiKey.findAll(),
        db.Letter.findAll()
      ]
      const registers = await Promise.all(models)
      registers.forEach((model) => {
        expect(Array.isArray(model)).toBe(true)
        expect(model).toHaveLength(0)
      })
      console.log('los modelos: ', models.length)
      console.log('los registros: ', registers.length)
      expect(models.length).toEqual(registers.length)
    })
  })
    
})

function nameOfDb(url:string): string {
  if (!url) return 'unknown'
  const parts = url.split('/')
  return parts[parts.length - 1] || 'unknown'
}
 