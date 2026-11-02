import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import session from 'supertest'
import app from '../../server/app.js'
import { About } from '../../server/configs/database.js'
import {
  createAuthenticatedAdminAgent,
  createAuthenticatedUserAgent,
  seedIntegrationUsers,
  resetSeedState,
  extractCsrfToken
} from '../helpers/auth.helper.js'

describe('About Integration Tests (Service, Repository & Routes)', () => {
  let adminAgent: ReturnType<typeof session.agent>
  let adminCsrfToken: string

  let userAgent: ReturnType<typeof session.agent>
  let userCsrfToken: string

  const anonymousAgent = session.agent(app)
  let anonymousCsrfToken: string

  beforeAll(async() => {
    resetSeedState()
    await seedIntegrationUsers()

    // 1. Crear sesiones
    const adminSession = await createAuthenticatedAdminAgent()
    adminAgent = adminSession.agent
    adminCsrfToken = adminSession.csrfToken

    const userSession = await createAuthenticatedUserAgent()
    userAgent = userSession.agent
    userCsrfToken = userSession.csrfToken

    // 2. Token CSRF anónimo a través de una ruta de API que pase por sessionRouter
    const anonInit = await anonymousAgent.get('/api/v1/auth/me')
    anonymousCsrfToken = extractCsrfToken(anonInit)

    // 3. Limpiar tabla about para iniciar tests en estado conocido
    await About.destroy({ where: {}, truncate: true, cascade: true }).catch(() => {})
  })

  afterAll(async() => {
    await About.destroy({ where: {}, truncate: true, cascade: true }).catch(() => {})
  })

  describe('1. GET /api/v1/about', () => {
    it('debe rechazar peticiones anónimas con 401 porque /about en session.routes tiene isAuthenticated', async() => {
      const res = await anonymousAgent.get('/api/v1/about')
      expect(res.status).toBe(401)
      expect(res.body.ok).toBe(false)
    })

    it('debe devolver 200 y el objeto por defecto cuando la tabla está vacía para un usuario autenticado', async() => {
      const res = await userAgent.get('/api/v1/about')
      expect(res.status).toBe(200)
      expect(res.body).toMatchObject({
        title: 'No title',
        picture: 'nopicture',
        text: 'no data yet',
        imgShow: false,
        enabled: true
      })
    })
  })

  describe('2. POST /api/v1/about (Creación)', () => {
    const newAboutPayload = {
      title: 'Sobre mí - Programador Fullstack',
      text: 'Experiencia en Node.js, Express y React.',
      picture: 'profile-pic-123.jpg',
      imgShow: true
    }

    it('debe rechazar la creación para usuarios anónimos con 401 (incluso con CSRF válido)', async() => {
      const res = await anonymousAgent
        .post('/api/v1/about')
        .set('x-csrf-token', anonymousCsrfToken)
        .send(newAboutPayload)

      expect(res.status).toBe(401)
    })

    it('debe rechazar la creación para usuarios comunes (rol USER) con 403', async() => {
      const res = await userAgent
        .post('/api/v1/about')
        .set('x-csrf-token', userCsrfToken)
        .send(newAboutPayload)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('ROLE_NOT_ALLOWED')
    })

    it('debe rechazar la petición si el ADMIN no envía el token CSRF', async() => {
      const res = await adminAgent
        .post('/api/v1/about')
        .send(newAboutPayload)

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('CSRF_DETECTED')
    })

    it('debe crear la sección About exitosamente con ADMIN autenticado y token CSRF', async() => {
      const res = await adminAgent
        .post('/api/v1/about')
        .set('x-csrf-token', adminCsrfToken)
        .send(newAboutPayload)

      expect(res.status).toBe(201)
      expect(res.body.message).toBe('About creado exitosamente')

      // Verificar persistencia en base de datos
      const stored = await About.findOne({ where: { title: newAboutPayload.title } })
      expect(stored).not.toBeNull()
      expect(stored?.title).toBe(newAboutPayload.title)
      expect(stored?.text).toBe(newAboutPayload.text)
      expect(stored?.imgShow).toBe(true)
      expect(stored?.enabled).toBe(true)
    })
  })

  describe('3. GET /api/v1/about (Lectura con datos existentes)', () => {
    it('debe retornar el registro guardado en la base de datos', async() => {
      const res = await userAgent.get('/api/v1/about')
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Sobre mí - Programador Fullstack')
      expect(res.body.text).toBe('Experiencia en Node.js, Express y React.')
      expect(res.body.imgShow).toBe(true)
    })
  })

  describe('4. PUT /api/v1/about/:id (Actualización)', () => {
    it('debe rechazar la actualización a usuarios sin rol ADMIN con 403', async() => {
      const current = await About.findOne()
      const aboutId = current!.id

      const res = await userAgent
        .put(`/api/v1/about/${aboutId}`)
        .set('x-csrf-token', userCsrfToken)
        .send({ title: 'Intento de cambio no autorizado' })

      expect(res.status).toBe(403)
      expect(res.body.code).toBe('ROLE_NOT_ALLOWED')
    })

    it('debe actualizar los datos correctamente con ADMIN y token CSRF', async() => {
      const current = await About.findOne()
      const aboutId = current!.id

      const updatePayload = {
        title: 'Título Actualizado por Admin',
        text: 'Nuevo texto con más detalles de proyectos.',
        imgShow: false,
        saver: true
      }

      const res = await adminAgent
        .put(`/api/v1/about/${aboutId}`)
        .set('x-csrf-token', adminCsrfToken)
        .send(updatePayload)

      expect(res.status).toBe(200)
      expect(res.body.title).toBe(updatePayload.title)
      expect(res.body.text).toBe(updatePayload.text)
      expect(res.body.imgShow).toBe(false)

      // Verificar en base de datos
      await current?.reload()
      expect(current?.title).toBe(updatePayload.title)
      expect(current?.text).toBe(updatePayload.text)
      expect(current?.imgShow).toBe(false)
    })
  })
})
