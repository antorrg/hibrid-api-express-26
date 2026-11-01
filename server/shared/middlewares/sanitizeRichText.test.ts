import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { sanitizeRichText, sanitizeArrayRichText } from './sanitizeRichText.js'

describe('sanitizeRichText middleware', () => {
  it('debe limpiar scripts y atributos peligrosos de campos directos permitiendo etiquetas seguras', () => {
    const middleware = sanitizeRichText(['text'])
    const req = {
      body: {
        title: 'Producto 1',
        text: '<p>Texto con <strong>negrita</strong> y <script>alert("xss")</script><img src="x" onerror="steal()" /></p>'
      }
    } as unknown as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    middleware(req, res, next)

    expect(req.body.text).toBe('<p>Texto con <strong>negrita</strong> y </p>')
    expect(next).toHaveBeenCalledOnce()
  })

  it('no debe fallar si req.body es null o undefined o el campo no es string', () => {
    const middleware = sanitizeRichText(['text'])
    const req = { body: undefined } as unknown as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    middleware(req, res, next)
    expect(next).toHaveBeenCalledOnce()

    const req2 = { body: { text: 12345 } } as unknown as Request
    middleware(req2, res, next)
    expect(req2.body.text).toBe(12345)
  })
})

describe('sanitizeArrayRichText middleware', () => {
  it('debe sanitizar los campos dentro de un array de objetos (variants)', () => {
    const middleware = sanitizeArrayRichText(['text'], ['variants'])
    const req = {
      body: {
        title: 'Producto con variantes',
        variants: [
          {
            picture: 'pic1.jpg',
            text: '<p>Variante 1 <em>itálica</em><script>badCode()</script></p>'
          },
          {
            picture: 'pic2.jpg',
            text: '<u>Subrayado</u><a href="javascript:alert(1)">link</a>'
          }
        ]
      }
    } as unknown as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    middleware(req, res, next)

    expect(req.body.variants[0].text).toBe('<p>Variante 1 <em>itálica</em></p>')
    // javascript: scheme is stripped, tag 'a' without href or stripped is sanitized
    expect(req.body.variants[1].text).not.toContain('javascript:')
    expect(req.body.variants[1].text).toContain('<u>Subrayado</u>')
    expect(next).toHaveBeenCalledOnce()
  })

  it('debe soportar múltiples nombres de array como variants e items', () => {
    const middleware = sanitizeArrayRichText(['text'], ['variants', 'items'])
    const req = {
      body: {
        items: [
          {
            text: '<b>Item 1</b><iframe src="malicious.com"></iframe>'
          }
        ]
      }
    } as unknown as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    middleware(req, res, next)

    expect(req.body.items[0].text).toBe('<b>Item 1</b>')
    expect(next).toHaveBeenCalledOnce()
  })

  it('no debe fallar si el array no existe, está vacío o contiene elementos no válidos', () => {
    const middleware = sanitizeArrayRichText(['text'], ['variants'])
    const req = {
      body: {
        variants: [null, undefined, 'no-object', { otherField: 'val' }]
      }
    } as unknown as Request
    const res = {} as Response
    const next = vi.fn() as NextFunction

    expect(() => middleware(req, res, next)).not.toThrow()
    expect(next).toHaveBeenCalledOnce()
  })
})
