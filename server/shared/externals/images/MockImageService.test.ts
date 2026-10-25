import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { MockImageService } from './MockImageService.js'
import envConfig from '../../../configs/envConfig.js'

const uploadDir = `./${envConfig.BaseTestUrl}`
const fakeFile = {
  originalname: 'test-image.png',
  buffer: Buffer.from('contenido-de-prueba', 'utf-8')
}

describe('MockImageService', () => {
  beforeAll(async() => {
    // Asegurar que exista la carpeta
    await fs.mkdir(uploadDir, { recursive: true })
  })

  afterAll(async() => {
    // Limpiar el directorio después de las pruebas
    try {
      const filePath = path.join(uploadDir, fakeFile.originalname)
      await fs.unlink(filePath)
    } catch {
      // ignorar si no existe
    }
  })

  it('debe subir un archivo localmente con mockUploadNewImage', async() => {
    const imageUrl = await MockImageService.uploadImage(fakeFile)

    // Verificar que devuelve una URL válida
    expect(imageUrl).toContain(fakeFile.originalname)

    // Verificar que el archivo fue creado
    const filePath = path.join(uploadDir, fakeFile.originalname)
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)

    expect(exists).toBe(true)
  })

  it('debe eliminar un archivo con mockFunctionDelete', async() => {
    // Subir primero el archivo
    const imageUrl = await MockImageService.uploadImage(fakeFile)

    // Eliminar con la función mock
    const result = await MockImageService.deleteImage(imageUrl)

    expect(result).toBe(`Imagen "${path.join(uploadDir, fakeFile.originalname)}" borrada exitosamente`)

    // Verificar que ya no existe
    const filePath = path.join(uploadDir, fakeFile.originalname)
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)

    expect(exists).toBe(false)
  })
})
