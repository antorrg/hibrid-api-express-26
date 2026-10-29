import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../server/app.js'
import { HMACToken } from '../../server/shared/auth/HMACToken.js'

describe('Contact Integration Tests (Frontend SSR + Backend Protection)', () => {
  beforeEach(() => {
    HMACToken.clearUsedNonces()
  })

  // Helper para simular lo que hace el cliente al leer document.getElementById('csrfToken').value
  const extractCsrfFromHtml = (html: string): string => {
    const match =
      html.match(/id=["']csrfToken["'][^>]*value=["']([^"']+)["']/) ||
      html.match(/value=["']([^"']+)["'][^>]*id=["']csrfToken["']/)
    return match ? match[1] : ''
  }

  describe('1. Renderizado SSR de la vista de Contacto (GET /contacto)', () => {
    it('debe responder 200 y renderizar la plantilla contact.ejs con el formulario', async() => {
      const res = await request(app).get('/contacto')

      expect(res.status).toBe(200)
      expect(res.text).toContain('<form id="sendEmail">')
      expect(res.text).toContain('<h1>Contacto:</h1>')
    })

    it('debe generar e inyectar el input oculto con el token CSRF', async() => {
      const res = await request(app).get('/contacto')

      expect(res.status).toBe(200)
      const token = extractCsrfFromHtml(res.text)
      expect(token).toBeTruthy()
      expect(token.split('.')).toHaveLength(3) // Formato nonce.timestamp.signature
    })

    it('debe incluir el campo trampa (Honeypot) oculto para bots', async() => {
      const res = await request(app).get('/contacto')

      expect(res.status).toBe(200)
      expect(res.text).toContain('id="website"')
      expect(res.text).toContain('name="website"')
      expect(res.text).toContain('tabindex="-1"')
    })
  })

  describe('2. Flujo legítimo completo (Frontend -> Backend)', () => {
    it('debe permitir enviar el formulario cuando se usa el token CSRF obtenido de la página', async() => {
      // 1. El cliente solicita la página
      const pageRes = await request(app).get('/contacto')
      expect(pageRes.status).toBe(200)

      const csrfToken = extractCsrfFromHtml(pageRes.text)
      expect(csrfToken).toBeTruthy()

      // 2. El cliente envía el formulario con el token CSRF obtenido y honeypot vacío
      const sendRes = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 'usuario.real@example.com',
          subject: 'Presupuesto de desarrollo',
          message: 'Hola, quisiera cotizar una aplicación web.',
          _csrf: csrfToken,
          website: ''
        })

      expect(sendRes.status).toBe(200)
      expect(sendRes.body).toHaveProperty('message')
    })
  })

  describe('3. Protección contra Cross-Site Request Forgery (CSRF)', () => {
    it('debe rechazar la petición con 401 si no se incluye el token CSRF', async() => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 'atacante@badsite.com',
          subject: 'Intento de CSRF sin token',
          message: 'Mensaje malicioso'
        })

      expect(res.status).toBe(401)
      expect(res.body.message).toContain('Token de seguridad requerido')
    })

    it('debe rechazar la petición con 403 si el token CSRF fue alterado o falsificado', async() => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 'atacante@badsite.com',
          subject: 'Intento con token adulterado',
          message: 'Mensaje malicioso',
          _csrf: 'fakeNonce12345678.1700000000000.badSignatureHex'
        })

      expect(res.status).toBe(403)
      expect(res.body.message).toContain('Token de seguridad inválido o manipulado')
    })

    it('debe impedir ataques de repetición (Replay Attack): un token no se puede usar 2 veces', async() => {
      // Obtenemos token legítimo
      const pageRes = await request(app).get('/contacto')
      const csrfToken = extractCsrfFromHtml(pageRes.text)

      const payload = {
        email: 'usuario@example.com',
        subject: 'Primer envío',
        message: 'Contenido del mensaje',
        _csrf: csrfToken
      }

      // Primer envío: exitoso
      const firstRes = await request(app).post('/api/v1/contact').send(payload)
      expect(firstRes.status).toBe(200)

      // Segundo envío con el mismo token: debe ser rechazado
      const secondRes = await request(app).post('/api/v1/contact').send(payload)
      expect(secondRes.status).toBe(403)
      expect(secondRes.body.message).toContain('ya ha sido utilizado')
    })

    it('debe aceptar el token si se envía mediante la cabecera x-csrf-token', async() => {
      const pageRes = await request(app).get('/contacto')
      const csrfToken = extractCsrfFromHtml(pageRes.text)

      const res = await request(app)
        .post('/api/v1/contact')
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'header.user@example.com',
          subject: 'Token en cabecera',
          message: 'Enviado con x-csrf-token'
        })

      expect(res.status).toBe(200)
    })
  })

  describe('4. Detección y bloqueo de Spam (Honeypot)', () => {
    it('debe responder 200 silencioso y abortar el envío si un bot rellena el campo website', async() => {
      const pageRes = await request(app).get('/contacto')
      const csrfToken = extractCsrfFromHtml(pageRes.text)

      // Un bot completa todos los campos, incluido el honeypot "website"
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 'spam.bot@marketing-leads.com',
          subject: 'Compre nuestros servicios de SEO',
          message: 'Excelente oferta por tiempo limitado',
          _csrf: csrfToken,
          website: 'https://spam-marketing-leads.com' // <-- Honeypot activado
        })

      // El middleware devuelve 200 para no alertar al bot
      expect(res.status).toBe(200)
      expect(res.body).toBe('Mensaje de contacto enviado exitosamente')
    })

    it('debe procesar el mensaje con normalidad si el campo website contiene solo espacios en blanco', async() => {
      const pageRes = await request(app).get('/contacto')
      const csrfToken = extractCsrfFromHtml(pageRes.text)

      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 'usuario.legitimo@example.com',
          subject: 'Consulta normal',
          message: 'Espacios en blanco no activan el honeypot',
          _csrf: csrfToken,
          website: '   '
        })

      expect(res.status).toBe(200)
    })
  })

  describe('5. Validación de payload y sanitización', () => {
    it('debe rechazar con 400 si el email no es de tipo string', async() => {
      const pageRes = await request(app).get('/contacto')
      const csrfToken = extractCsrfFromHtml(pageRes.text)

      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 123456, // Tipo inválido
          subject: 'Consulta',
          message: 'Mensaje de prueba',
          _csrf: csrfToken
        })

      expect(res.status).toBe(400)
    })

    it('debe rechazar con 400 si faltan campos obligatorios', async() => {
      const pageRes = await request(app).get('/contacto')
      const csrfToken = extractCsrfFromHtml(pageRes.text)

      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          email: 'usuario@example.com',
          _csrf: csrfToken
          // Faltan subject y message
        })

      expect(res.status).toBe(400)
    })
  })
})
