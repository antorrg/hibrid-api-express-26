import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AboutService } from './AboutService.js'
import { AboutController } from './AboutController.js'
import type { BaseRepository } from '../../shared/repositories/BaseRepository.js'
import type { ImageService } from '../images/ImageService.js'
import type { IAbout, IAboutCreate, IAboutUpdate } from './About.types.js'

describe('AboutService & AboutController Unit Tests', () => {
  let mockRepository: Partial<BaseRepository<IAbout, IAboutCreate, IAboutUpdate>>
  let mockImageService: Partial<ImageService>
  let service: AboutService
  let controller: AboutController

  const fakeAbout: IAbout = {
    id: 'a1b2c3d4-1234-5678-abcd-111122223333',
    title: 'Acerca de mí',
    picture: 'https://storage.googleapis.com/test-bucket/about.jpg',
    text: 'Desarrollador fullstack especializado en backend.',
    imgShow: true,
    enabled: true
  }

  beforeEach(() => {
    mockRepository = {
      getAllEnabled: vi.fn().mockResolvedValue([fakeAbout]),
      create: vi.fn().mockResolvedValue(fakeAbout),
      update: vi.fn().mockResolvedValue({ ...fakeAbout, title: 'Título Actualizado' })
    }

    mockImageService = {
      consumeImage: vi.fn().mockResolvedValue(undefined),
      handleReplacedImage: vi.fn().mockResolvedValue(undefined)
    }

    service = new AboutService(
      mockRepository as BaseRepository<IAbout, IAboutCreate, IAboutUpdate>,
      mockImageService as ImageService
    )

    controller = new AboutController(service)
  })

  describe('AboutService', () => {
    it('get() debe devolver un único objeto (response[0]), no un array', async() => {
      const result = await service.get()

      expect(mockRepository.getAllEnabled).toHaveBeenCalledTimes(1)
      expect(Array.isArray(result)).toBe(false)
      expect(result).toEqual(fakeAbout)
    })

    it('get() debe devolver datos mock por defecto cuando no hay registros en la base de datos', async() => {
      mockRepository.getAllEnabled = vi.fn().mockResolvedValue([])

      const result = await service.get()

      expect(result).toMatchObject({
        title: 'No title',
        picture: 'nopicture',
        text: 'no data yet',
        imgShow: false,
        enabled: true,
        id: expect.any(String)
      })
    })

    it('create() debe generar UUID y establecer enabled: true antes de llamar al repository', async() => {
      const payload: IAboutCreate = {
        title: 'Nueva sección Acerca de',
        picture: 'https://storage.googleapis.com/test-bucket/temp.jpg',
        text: 'Texto de prueba',
        imgShow: true
      }

      await service.create(payload)

      expect(mockRepository.create).toHaveBeenCalledTimes(1)
      const passedData = (mockRepository.create as any).mock.calls[0][0]
      expect(passedData).toMatchObject({
        ...payload,
        id: expect.any(String),
        enabled: true
      })
      expect(mockImageService.consumeImage).toHaveBeenCalledWith(payload.picture)
    })

    it('create() debe manejar errores de consumo de imagen sin lanzar excepción', async() => {
      mockImageService.consumeImage = vi.fn().mockRejectedValue(new Error('Storage failure'))

      const payload: IAboutCreate = {
        title: 'Nueva sección',
        picture: 'temp-img.jpg',
        text: 'Texto',
        imgShow: true
      }

      await expect(service.create(payload)).resolves.not.toThrow()
      expect(mockRepository.create).toHaveBeenCalledTimes(1)
    })

    it('update() debe actualizar datos y manejar reemplazo de imagen cuando cambia la foto', async() => {
      const updatePayload: IAboutUpdate = {
        title: 'Título Nuevo',
        picture: 'https://storage.googleapis.com/test-bucket/nueva-foto.jpg',
        saver: true
      }

      const result = await service.update(fakeAbout.id, updatePayload)

      expect(mockRepository.update).toHaveBeenCalledWith(fakeAbout.id, {
        title: 'Título Nuevo',
        picture: 'https://storage.googleapis.com/test-bucket/nueva-foto.jpg'
      })
      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith(
        fakeAbout.picture,
        updatePayload.picture,
        true
      )
      expect(result.title).toBe('Título Actualizado')
    })
  })

  describe('AboutController', () => {
    it('get() debe responder 200 con el registro', async() => {
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      }

      await controller.get({} as any, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(fakeAbout)
    })

    it('create() debe responder 201 con mensaje de éxito', async() => {
      const mockReq: any = {
        body: {
          title: 'Nuevo título',
          text: 'Texto',
          picture: 'pic.jpg',
          imgShow: true
        }
      }
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      }

      await controller.create(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'About creado exitosamente' })
    })

    it('update() debe responder 200 con los datos actualizados', async() => {
      const mockReq: any = {
        params: { id: fakeAbout.id },
        body: { title: 'Título Actualizado' }
      }
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      }

      await controller.update(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Título Actualizado' })
      )
    })
  })
})
