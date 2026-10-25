import { describe, it, expect, beforeEach } from 'vitest'
import { EmailService, MockEmailTransport } from './EmailService.js'

describe('EmailService', () => {
  let mockTransport: MockEmailTransport
  let emailService: EmailService

  beforeEach(() => {
    mockTransport = new MockEmailTransport()
    emailService = new EmailService(mockTransport)
  })

  describe('sendTemplateEmail', () => {
    it('should send an email with the correct template and variables', async() => {
      await emailService.sendTemplateEmail(
        'email-verify',
        { verification_link: 'https://example.com/verify/123' },
        {
          to: 'test@example.com',
          subject: 'Verifica tu correo'
        }
      )

      expect(mockTransport.sent).toHaveLength(1)
      const sentEmail = mockTransport.sent[0]

      expect(sentEmail.to).toBe('test@example.com')
      expect(sentEmail.subject).toBe('Verifica tu correo')
      // Verify html content contains the variable we passed
      expect(sentEmail.html).toBeDefined()
      expect(sentEmail.html).toContain('https://example.com/verify/123')
    })

    it('should handle template loading errors cleanly', async() => {
      // Expecting it to fail if template doesn't exist
      await expect(emailService.sendTemplateEmail(
        'non-existent-template',
        {},
        { to: 'test@example.com', subject: 'Fail' }
      )).rejects.toThrow()
    })
  })

  describe('sendRawEmail', () => {
    it('should send a raw email correctly', async() => {
      const rawOptions = {
        to: 'contact@example.com',
        subject: 'Mensaje de contacto',
        text: 'Hola, este es un mensaje de prueba',
        html: '<p>Hola, este es un mensaje de prueba</p>'
      }

      await emailService.sendRawEmail(rawOptions)

      expect(mockTransport.sent).toHaveLength(1)
      const sentEmail = mockTransport.sent[0]

      expect(sentEmail).toEqual(rawOptions)
    })
  })
})
