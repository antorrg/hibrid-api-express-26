import { beforeAll, afterAll } from 'vitest'
import { startUp, closeDatabase } from '../../server/configs/database.js'

beforeAll(async() => {
  await startUp(true, true)
})

afterAll(async() => {
  await closeDatabase()
})