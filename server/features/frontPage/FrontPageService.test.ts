import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FrontPageService } from './FrontPageService.js'
import { FrontPageController } from './FrontPageController.js'
import type { BaseRepository } from '../../shared/repositories/BaseRepository.js'
import type { ImageService } from '../images/ImageService.js'
import type { IFrontPage, IFrontCreate, IFrotnUpdate } from './FrontPage.types.js'

describe('FrontPageService & FrontPageController Unit Tests', () => {
  let mockRepository: Partial<BaseRepository<IFrontPage, any, IFrotnUpdate>>
  let mockImageService: Partial<ImageService>
  let service: FrontPageService
  let controller: FrontPageController

  const fakeFrontPage: IFrontPage = {
    id: 'f7b3a988-1234-5678-abcd-111122223333',
    title: 'Landing Page Title',
    info_header: 'Welcome to our platform',
    description: 'Detailed description here',
    picture: 'https://storage.googleapis.com/test-bucket/frontpage.jpg',
    enabled: true
  }

  beforeEach(() => {
    mockRepository = {
      getAllEnabled: vi.fn().mockResolvedValue([fakeFrontPage]),
      create: vi.fn().mockResolvedValue(fakeFrontPage),
      update: vi.fn().mockResolvedValue({ ...fakeFrontPage, title: 'Updated Title' })
    }

    mockImageService = {
      consumeImage: vi.fn().mockResolvedValue(undefined),
      handleReplacedImage: vi.fn().mockResolvedValue(undefined)
    }

    service = new FrontPageService(
      mockRepository as BaseRepository<IFrontPage, any, IFrotnUpdate>,
      mockImageService as ImageService
    )

    controller = new FrontPageController(service)
  })

  describe('FrontPageService', () => {
    it('get() should return a single object (response[0]), not an array', async() => {
      const result = await service.get()

      expect(mockRepository.getAllEnabled).toHaveBeenCalledTimes(1)
      expect(Array.isArray(result)).toBe(false)
      expect(result).toEqual(fakeFrontPage)
    })

    it('get() should throw NOT_FOUND error when no frontpage exists', async() => {
      mockRepository.getAllEnabled = vi.fn().mockResolvedValue([])

      await expect(service.get()).rejects.toThrow('FrontPage no encontrada')
    })

    it('create() should form entity with UUID, enabled: true, create in repo and consume image', async() => {
      const createData: IFrontCreate = {
        title: 'New Title',
        info_header: 'New Header',
        description: 'New Description',
        picture: 'https://storage.googleapis.com/test-bucket/new.jpg'
      }

      await service.create(createData)

      expect(mockRepository.create).toHaveBeenCalledTimes(1)
      const passedData = (mockRepository.create as any).mock.calls[0][0]
      expect(passedData.id).toBeDefined()
      expect(typeof passedData.id).toBe('string')
      expect(passedData.title).toBe(createData.title)
      expect(passedData.enabled).toBe(true)

      expect(mockImageService.consumeImage).toHaveBeenCalledWith(createData.picture)
    })

    it('update() should update record and handle replaced image when picture changed', async() => {
      const updateData: IFrotnUpdate = {
        title: 'Updated Title',
        picture: 'https://storage.googleapis.com/test-bucket/replaced.jpg',
        saver: true
      }

      const result = await service.update(fakeFrontPage.id, updateData)

      expect(mockRepository.update).toHaveBeenCalledWith(fakeFrontPage.id, {
        title: 'Updated Title',
        picture: 'https://storage.googleapis.com/test-bucket/replaced.jpg'
      })
      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith(
        fakeFrontPage.picture,
        updateData.picture,
        true
      )
      expect(result.title).toBe('Updated Title')
    })
  })

  describe('FrontPageController', () => {
    const mockRes = () => {
      const res: any = {}
      res.status = vi.fn().mockReturnValue(res)
      res.json = vi.fn().mockReturnValue(res)
      return res
    }

    it('get should return 200 with the single FrontPage object', async() => {
      const req: any = {}
      const res = mockRes()

      await controller.get(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(fakeFrontPage)
    })

    it('create should return 201 after creating', async() => {
      const req: any = {
        body: {
          title: 'New Title',
          info_header: 'Header',
          description: 'Desc',
          picture: 'https://example.com/pic.jpg'
        }
      }
      const res = mockRes()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ message: 'FrontPage creada exitosamente' })
    })

    it('update should return 200 with the updated object', async() => {
      const req: any = {
        params: { id: fakeFrontPage.id },
        body: { title: 'Updated Title' }
      }
      const res = mockRes()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }))
    })
  })
})
