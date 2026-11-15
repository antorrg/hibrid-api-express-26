import { describe, it, expect, vi, beforeEach } from 'vitest'
import envConfig from '../../../configs/envConfig.js'

const {
  mockSave,
  mockDelete,
  mockFile,
  mockBucket,
  mockGetDownloadURL,
  mockInitializeApp,
  mockGetApps,
  mockGetApp,
  mockCert
} = vi.hoisted(() => {
  const mockSave = vi.fn()
  const mockDelete = vi.fn()
  const mockFile = vi.fn(() => ({
    save: mockSave,
    delete: mockDelete
  }))
  const mockBucket = vi.fn(() => ({
    file: mockFile
  }))
  const mockGetDownloadURL = vi.fn()
  const mockInitializeApp = vi.fn(() => ({ name: '[DEFAULT]' }))
  const mockGetApps = vi.fn(() => [])
  const mockGetApp = vi.fn(() => ({ name: '[DEFAULT]' }))
  const mockCert = vi.fn((creds) => creds)

  return {
    mockSave,
    mockDelete,
    mockFile,
    mockBucket,
    mockGetDownloadURL,
    mockInitializeApp,
    mockGetApps,
    mockGetApp,
    mockCert
  }
})

vi.mock('firebase-admin/app', () => ({
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
  cert: mockCert
}))

vi.mock('firebase-admin/storage', () => ({
  getStorage: vi.fn(() => ({
    bucket: mockBucket
  })),
  getDownloadURL: mockGetDownloadURL
}))

import { uploadImageToFirebase, deleteImageFromStorage } from './firebase.js'

describe('firebase storage service (unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetApps.mockReturnValue([])
    mockSave.mockResolvedValue(undefined)
    mockDelete.mockResolvedValue(undefined)
  })

  describe('uploadImageToFirebase', () => {
    it('debe inicializar firebase-admin, sanitizar el nombre, guardar el buffer y devolver la URL de descarga', async() => {
      const expectedUrl = `https://firebasestorage.googleapis.com/v0/b/${envConfig.FireStoreBuck}/o/imagesApi%2Ftest.png?alt=media&token=123`
      mockGetDownloadURL.mockResolvedValue(expectedUrl)

      const fakeFile = {
        originalname: 'mi foto con espacios!@#.png',
        buffer: Buffer.from('fake-image-bytes'),
        mimetype: 'image/png'
      }

      const url = await uploadImageToFirebase(fakeFile)

      expect(mockCert).toHaveBeenCalledWith({
        projectId: envConfig.FirePId,
        clientEmail: envConfig.FireClientEmail,
        privateKey: envConfig.FirePrivateKey
      })
      expect(mockInitializeApp).toHaveBeenCalledOnce()
      expect(mockFile).toHaveBeenCalledWith(
        expect.stringMatching(/^imagesApi\/[a-z0-9]+-mi_foto_con_espacios___.png$/)
      )
      expect(mockSave).toHaveBeenCalledWith(fakeFile.buffer, {
        metadata: { contentType: 'image/png' },
        resumable: false
      })
      expect(url).toBe(expectedUrl)
    })

    it('debe reutilizar la instancia si getApps() ya tiene una app inicializada', async() => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }] as any)
      mockGetDownloadURL.mockResolvedValue('https://example.com/img.png')

      await uploadImageToFirebase({
        originalname: 'test.png',
        buffer: Buffer.from('data'),
        mimetype: 'image/png'
      })

      expect(mockGetApp).toHaveBeenCalledOnce()
      expect(mockInitializeApp).not.toHaveBeenCalled()
    })

    it('debe lanzar error controlado cuando falla la subida', async() => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSave.mockRejectedValue(new Error('Storage quota exceeded'))

      await expect(
        uploadImageToFirebase({
          originalname: 'test.png',
          buffer: Buffer.from('data'),
          mimetype: 'image/png'
        })
      ).rejects.toThrow('Error al subir imagen')

      consoleSpy.mockRestore()
    })
  })

  describe('deleteImageFromStorage', () => {
    it('debe extraer el path decodificado desde la URL de Firebase y eliminar con ignoreNotFound: true', async() => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const encodedPath = encodeURIComponent('imagesApi/m123abc-test_image.png')
      const validUrl = `https://firebasestorage.googleapis.com/v0/b/${envConfig.FireStoreBuck}/o/${encodedPath}?alt=media&token=abc-123`

      const result = await deleteImageFromStorage(validUrl)

      expect(mockFile).toHaveBeenCalledWith('imagesApi/m123abc-test_image.png')
      expect(mockDelete).toHaveBeenCalledWith({ ignoreNotFound: true })
      expect(result).toBe('Imagen eliminada correctamente')

      consoleSpy.mockRestore()
    })

    it('debe rechazar URLs que no pertenezcan al bucket configurado', async() => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const invalidUrl = 'https://firebasestorage.googleapis.com/v0/b/otro-bucket.appspot.com/o/imagesApi%2Ftest.png?alt=media'

      await expect(deleteImageFromStorage(invalidUrl)).rejects.toThrow(
        `Error al eliminar imagen: ${invalidUrl}`
      )
      expect(mockDelete).not.toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })
})
