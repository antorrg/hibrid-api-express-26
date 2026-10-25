import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ImageDbService } from './ImageDbService.js'
import type { ImageDbRepository } from './ImageDbRepository.js'
import type { ImageDeleteFn } from './Image.types.js'

describe('ImageDbService', () => {
  let mockRepo: ImageDbRepository
  let mockImageDeleteService: ReturnType<typeof vi.fn>
  let service: ImageDbService

  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      getWithPages: vi.fn().mockResolvedValue({ info: { currentPage: 1, pages: 1, total: 1 }, data: [] }),
      getImage: vi.fn().mockResolvedValue({ id: 'img-1', imageUrl: 'https://example.com/test.jpg' }),
      remove: vi.fn().mockResolvedValue('Imagen borrada'),
      internalRemove: vi.fn().mockResolvedValue('Imagen internal borrada')
    } as unknown as ImageDbRepository

    mockImageDeleteService = vi.fn().mockResolvedValue(undefined)

    service = new ImageDbService(mockRepo, mockImageDeleteService as unknown as ImageDeleteFn)
  })

  describe('save', () => {
    it('should generate a UUID and save image record to repository', async() => {
      await service.save('https://example.com/photo.jpg')

      expect(mockRepo.save).toHaveBeenCalledTimes(1)
      const savedPayload = (mockRepo.save as any).mock.calls[0][0]
      expect(savedPayload.imageUrl).toBe('https://example.com/photo.jpg')
      expect(savedPayload.id).toBeDefined()
      expect(typeof savedPayload.id).toBe('string')
    })
  })

  describe('getWithPages and getImage', () => {
    it('should delegate getWithPages to repository', async() => {
      const query = { page: 2, limit: 10 }
      const res = await service.getWithPages(query)

      expect(mockRepo.getWithPages).toHaveBeenCalledWith(query)
      expect(res.info.currentPage).toBe(1)
    })

    it('should delegate getImage to repository', async() => {
      const res = await service.getImage('img-1')

      expect(mockRepo.getImage).toHaveBeenCalledWith('img-1')
      expect(res.imageUrl).toBe('https://example.com/test.jpg')
    })
  })

  describe('remove', () => {
    it('should delete from storage and remove from database when image exists', async() => {
      const result = await service.remove('img-1')

      expect(mockRepo.getImage).toHaveBeenCalledWith('img-1')
      expect(mockImageDeleteService).toHaveBeenCalledWith('https://example.com/test.jpg')
      expect(mockRepo.remove).toHaveBeenCalledWith('img-1')
      expect(result).toBe('Imagen eliminada exitosamente')
    })

    it('should throw NOT_FOUND error when record is not found', async() => {
      (mockRepo.getImage as any).mockResolvedValueOnce(null)

      await expect(service.remove('unknown-id')).rejects.toThrow()
      expect(mockImageDeleteService).not.toHaveBeenCalled()
      expect(mockRepo.remove).not.toHaveBeenCalled()
    })
  })

  describe('consumeImage', () => {
    it('should do nothing if url is empty, null, or undefined', async() => {
      await service.consumeImage(null)
      await service.consumeImage(undefined)
      await service.consumeImage('')

      expect(mockRepo.internalRemove).not.toHaveBeenCalled()
    })

    it('should call internalRemove with given url', async() => {
      await service.consumeImage('https://example.com/temp.jpg')

      expect(mockRepo.internalRemove).toHaveBeenCalledWith('https://example.com/temp.jpg')
    })
  })

  describe('handleReplacedImage', () => {
    it('should do nothing if newUrl is falsy', async() => {
      await service.handleReplacedImage('old.jpg', null, false)
      await service.handleReplacedImage('old.jpg', undefined, false)
      await service.handleReplacedImage('old.jpg', '', false)

      expect(mockRepo.internalRemove).not.toHaveBeenCalled()
      expect(mockImageDeleteService).not.toHaveBeenCalled()
      expect(mockRepo.save).not.toHaveBeenCalled()
    })

    it('should do nothing if newUrl is identical to oldUrl', async() => {
      await service.handleReplacedImage('same.jpg', 'same.jpg', false)

      expect(mockRepo.internalRemove).not.toHaveBeenCalled()
      expect(mockImageDeleteService).not.toHaveBeenCalled()
      expect(mockRepo.save).not.toHaveBeenCalled()
    })

    it('should consume newUrl and delete oldUrl from storage when saver is false', async() => {
      await service.handleReplacedImage('old.jpg', 'new.jpg', false)

      expect(mockRepo.internalRemove).toHaveBeenCalledWith('new.jpg')
      expect(mockImageDeleteService).toHaveBeenCalledWith('old.jpg')
      expect(mockRepo.save).not.toHaveBeenCalled()
    })

    it('should consume newUrl and preserve oldUrl in DB gallery when saver is true', async() => {
      await service.handleReplacedImage('old.jpg', 'new.jpg', true)

      expect(mockRepo.internalRemove).toHaveBeenCalledWith('new.jpg')
      expect(mockRepo.save).toHaveBeenCalledTimes(1)
      const saved = (mockRepo.save as any).mock.calls[0][0]
      expect(saved.imageUrl).toBe('old.jpg')
      expect(mockImageDeleteService).not.toHaveBeenCalled()
    })

    it('should interpret string "true" as saver=true', async() => {
      await service.handleReplacedImage('old.jpg', 'new.jpg', 'true')

      expect(mockRepo.internalRemove).toHaveBeenCalledWith('new.jpg')
      expect(mockRepo.save).toHaveBeenCalledTimes(1)
      expect(mockImageDeleteService).not.toHaveBeenCalled()
    })

    it('should consume newUrl without touching storage if oldUrl is not provided', async() => {
      await service.handleReplacedImage(undefined, 'new.jpg', false)

      expect(mockRepo.internalRemove).toHaveBeenCalledWith('new.jpg')
      expect(mockImageDeleteService).not.toHaveBeenCalled()
      expect(mockRepo.save).not.toHaveBeenCalled()
    })

    it('should still process oldUrl deletion if consuming newUrl fails in DB', async() => {
      (mockRepo.internalRemove as any).mockRejectedValueOnce(new Error('Record not found'))

      await service.handleReplacedImage('old.jpg', 'new.jpg', false)

      // Storage cleanup of old image should still proceed
      expect(mockImageDeleteService).toHaveBeenCalledWith('old.jpg')
    })
  })

  describe('handleDeletedImage', () => {
    it('should do nothing if url is falsy', async() => {
      await service.handleDeletedImage(null, false)
      await service.handleDeletedImage(undefined, false)
      await service.handleDeletedImage('', false)

      expect(mockImageDeleteService).not.toHaveBeenCalled()
      expect(mockRepo.save).not.toHaveBeenCalled()
    })

    it('should delete image from storage when saver is false', async() => {
      await service.handleDeletedImage('delete-me.jpg', false)

      expect(mockImageDeleteService).toHaveBeenCalledWith('delete-me.jpg')
      expect(mockRepo.save).not.toHaveBeenCalled()
    })

    it('should save image to gallery DB when saver is true', async() => {
      await service.handleDeletedImage('save-me.jpg', true)

      expect(mockRepo.save).toHaveBeenCalledTimes(1)
      const saved = (mockRepo.save as any).mock.calls[0][0]
      expect(saved.imageUrl).toBe('save-me.jpg')
      expect(mockImageDeleteService).not.toHaveBeenCalled()
    })

    it('should interpret string "true" as saver=true', async() => {
      await service.handleDeletedImage('save-me.jpg', 'true')

      expect(mockRepo.save).toHaveBeenCalledTimes(1)
      expect(mockImageDeleteService).not.toHaveBeenCalled()
    })
  })
})
