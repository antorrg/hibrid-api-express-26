import { describe, it, expect } from 'vitest'
import envConfig from '../../../configs/envConfig.js'
import { uploadImageToFirebase, deleteImageFromStorage } from './firebase.js'

// PNG transparente válido de 1x1 píxel
const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

describe('Firebase Storage Real Connection & Methods (Smoke Test)', () => {
  let uploadedUrl = ''

  it('debe tener credenciales reales configuradas en el entorno', () => {
    expect(envConfig.FirePId).toBeTruthy()
    expect(envConfig.FireStoreBuck).toBeTruthy()
    expect(envConfig.FireClientEmail).toContain('@')
    expect(envConfig.FirePrivateKey).toContain('BEGIN PRIVATE KEY')
    expect(envConfig.FirePrivateKey).not.toContain('TU_CLAVE_PRIVADA')
  })

  it('debe subir una imagen real a Firebase Storage y devolver una URL pública accesible (HTTP 200)', async() => {
    uploadedUrl = await uploadImageToFirebase({
      originalname: 'smoke-test-firebase-admin.png',
      buffer: TINY_PNG_BUFFER,
      mimetype: 'image/png'
    })

    expect(uploadedUrl).toContain(
      `https://firebasestorage.googleapis.com/v0/b/${envConfig.FireStoreBuck}/o/imagesApi%2F`
    )
    expect(uploadedUrl).toContain('smoke-test-firebase-admin.png')
    expect(uploadedUrl).toContain('token=')

    // Verificar que la URL devuelta sea accesible públicamente
    const response = await fetch(uploadedUrl)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('image/png')
  }, 15000)

  it('debe eliminar la imagen subida de Firebase Storage y dejar de estar disponible', async() => {
    expect(uploadedUrl).toBeTruthy()

    const result = await deleteImageFromStorage(uploadedUrl)
    expect(result).toBe('Imagen eliminada correctamente')

    // Verificar que la imagen ya no exista en Storage (404 / 403)
    const response = await fetch(uploadedUrl)
    expect(response.ok).toBe(false)
  }, 15000)

  it('debe ser idempotente al intentar eliminar de nuevo una imagen que ya no existe', async() => {
    expect(uploadedUrl).toBeTruthy()

    const result = await deleteImageFromStorage(uploadedUrl)
    expect(result).toBe('Imagen eliminada correctamente')
  }, 15000)
})
