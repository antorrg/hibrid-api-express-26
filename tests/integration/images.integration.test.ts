import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import session from 'supertest'
import path from 'node:path'
import fs from 'node:fs/promises'
import app from '../../server/app.js'
import * as db from '../../server/configs/database.js'
import { Image } from '../../server/configs/database.js'
import envConfig from '../../server/configs/envConfig.js'
import {
  createAuthenticatedAdminAgent,
  createAuthenticatedUserAgent,
  seedIntegrationUsers,
  resetSeedState,
  extractCsrfToken
} from '../helpers/auth.helper.js'

describe('Images Integration Tests (Protected with Auth & RBAC)', () => {
  const uploadDir = `./${envConfig.BaseTestUrl}`
  const fakeImageFile = {
    name: 'integration-test.png',
    buffer: Buffer.from('fake-png-content-data', 'utf-8')
  }

  let adminAgent: ReturnType<typeof session.agent>
  let adminCsrfToken: string

  let userAgent: ReturnType<typeof session.agent>
  let userCsrfToken: string

  const anonymousAgent = session.agent(app)
  let anonymousCsrfToken: string

  beforeAll(async() => {
    // 1. Inicializar base de datos limpia
    resetSeedState()
    await db.startUp(true, true)
    await fs.mkdir(uploadDir, { recursive: true })

    // 2. Sembrar usuarios de prueba
    await seedIntegrationUsers()

    // 3. Crear sesiones autenticadas
    const adminSession = await createAuthenticatedAdminAgent()
    adminAgent = adminSession.agent
    adminCsrfToken = adminSession.csrfToken

    const userSession = await createAuthenticatedUserAgent()
    userAgent = userSession.agent
    userCsrfToken = userSession.csrfToken

    // 4. Token CSRF para cliente anónimo
    const anonInit = await anonymousAgent.get('/api/v1/user')
    anonymousCsrfToken = extractCsrfToken(anonInit)
  })

  afterAll(async() => {
    await db.closeDatabase()

    try {
      const filePath = path.join(uploadDir, fakeImageFile.name)
      await fs.unlink(filePath)
    } catch {
      // Ignorar si ya fue eliminado
    }
  })

  describe('1. Control de Acceso (Autenticación y RBAC)', () => {
    it('debe rechazar GET /api/v1/images con 401 si no está autenticado', async() => {
      const res = await anonymousAgent.get('/api/v1/images')
      expect(res.status).toBe(401)
      expect(res.body.code).toBe('UNAUTHORIZED')
    })

    it('debe rechazar POST /api/v1/images/upload con 401 si no está autenticado (con CSRF válido)', async() => {
      const res = await anonymousAgent
        .post('/api/v1/images/upload')
        .set('x-csrf-token', anonymousCsrfToken)
        .attach('image', fakeImageFile.buffer, fakeImageFile.name)

      expect(res.status).toBe(401)
      expect(res.body.code).toBe('UNAUTHORIZED')
    })

    it('debe rechazar DELETE /api/v1/images/:id con 401 si no está autenticado (con CSRF válido)', async() => {
      const res = await anonymousAgent
        .delete('/api/v1/images/018f2d5e-4b2a-7c9e-bf43-123456789abc')
        .set('x-csrf-token', anonymousCsrfToken)

      expect(res.status).toBe(401)
      expect(res.body.code).toBe('UNAUTHORIZED')
    })

    it('debe rechazar GET /api/v1/images con 403 (ROLE_NOT_ALLOWED) si el usuario es USER regular', async() => {
      const res = await userAgent.get('/api/v1/images')
      expect(res.status).toBe(403)
      expect(res.body.code).toBe('ROLE_NOT_ALLOWED')
    })

    it('debe rechazar POST /api/v1/images/upload con 403 (ROLE_NOT_ALLOWED) si el usuario es USER regular', async() => {
      const res = await userAgent
        .post('/api/v1/images/upload')
        .set('x-csrf-token', userCsrfToken)
        .attach('image', fakeImageFile.buffer, fakeImageFile.name)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('ROLE_NOT_ALLOWED')
    })
  })

  describe('2. CSRF Protection en rutas de imágenes para ADMIN', () => {
    it('debe rechazar POST /api/v1/images/upload si falta el header x-csrf-token', async() => {
      const res = await adminAgent
        .post('/api/v1/images/upload')
        .attach('image', fakeImageFile.buffer, fakeImageFile.name)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('CSRF_DETECTED')
    })

    it('debe rechazar DELETE /api/v1/images/:id si falta el header x-csrf-token', async() => {
      const res = await adminAgent
        .delete('/api/v1/images/018f2d5e-4b2a-7c9e-bf43-123456789abc')

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('CSRF_DETECTED')
    })
  })

  describe('3. POST /api/v1/images/upload (con ADMIN autenticado)', () => {
    it('debe retornar 400 si no se adjunta ningún archivo', async() => {
      const res = await adminAgent
        .post('/api/v1/images/upload')
        .set('x-csrf-token', adminCsrfToken)

      expect(res.status).toBe(400)
      expect(res.body.code).toBe('FILE_REQUIRED')
      expect(res.body.message).toBe('No hay Imagen')
    })

    it('debe subir la imagen exitosamente y registrarla en la base de datos', async() => {
      const res = await adminAgent
        .post('/api/v1/images/upload')
        .set('x-csrf-token', adminCsrfToken)
        .attach('image', fakeImageFile.buffer, fakeImageFile.name)

      expect(res.status).toBe(201)
      expect(typeof res.body).toBe('string')
      expect(res.body).toContain(fakeImageFile.name)

      // Verificar persistencia en base de datos
      const imageUrl = res.body
      const dbRecord = await Image.findOne({ where: { imageUrl } })
      expect(dbRecord).not.toBeNull()
      expect(dbRecord?.imageUrl).toBe(imageUrl)

      // Verificar existencia física del archivo
      const filePath = path.join(uploadDir, fakeImageFile.name)
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false)
      expect(fileExists).toBe(true)
    })
  })

  describe('4. GET /api/v1/images (Listado y Paginación para ADMIN)', () => {
    it('debe listar las imágenes con su estructura paginada', async() => {
      const res = await adminAgent.get('/api/v1/images')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('info')
      expect(res.body).toHaveProperty('data')
      expect(res.body.info.currentPage).toBe(1)
      expect(res.body.info.total).toBeGreaterThanOrEqual(1)
      expect(Array.isArray(res.body.data)).toBe(true)

      const found = res.body.data.some((img: { imageUrl: string }) =>
        img.imageUrl.includes(fakeImageFile.name)
      )
      expect(found).toBe(true)
    })

    it('debe respetar los parámetros de paginación y orden validados por req-valid-express', async() => {
      const res = await adminAgent.get('/api/v1/images?page=1&limit=2&order=ASC')

      expect(res.status).toBe(200)
      expect(res.body.info.currentPage).toBe(1)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeLessThanOrEqual(2)
    })
  })

  describe('5. DELETE /api/v1/images/:id (con ADMIN autenticado)', () => {
    it('debe retornar 400 si el parámetro :id no es un UUID válido', async() => {
      const res = await adminAgent
        .delete('/api/v1/images/id-invalido-123')
        .set('x-csrf-token', adminCsrfToken)

      expect(res.status).toBe(400)
    })

    it('debe retornar 404 si el UUID no existe en la base de datos', async() => {
      const nonExistentUuid = '018f2d5e-4b2a-7c9e-bf43-123456789abc'
      const res = await adminAgent
        .delete(`/api/v1/images/${nonExistentUuid}`)
        .set('x-csrf-token', adminCsrfToken)

      expect(res.status).toBe(404)
      expect(res.body.code).toBe('NOT_FOUND')
    })

    it('debe eliminar la imagen de la base de datos y su archivo físico', async() => {
      // 1. Obtener la imagen registrada previamente
      const listRes = await adminAgent.get('/api/v1/images')
      const targetImage = listRes.body.data.find((img: { imageUrl: string }) =>
        img.imageUrl.includes(fakeImageFile.name)
      )
      expect(targetImage).toBeDefined()
      const imageId = targetImage.id

      // 2. Eliminar la imagen
      const deleteRes = await adminAgent
        .delete(`/api/v1/images/${imageId}`)
        .set('x-csrf-token', adminCsrfToken)

      expect(deleteRes.status).toBe(200)
      expect(deleteRes.body).toBe('Imagen eliminada exitosamente')

      // 3. Verificar que ya no existe en la base de datos
      const dbRecord = await Image.findByPk(imageId)
      expect(dbRecord).toBeNull()

      // 4. Verificar que el archivo físico fue eliminado del storage local
      const filePath = path.join(uploadDir, fakeImageFile.name)
      const fileExists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false)
      expect(fileExists).toBe(false)
    })
  })
})
