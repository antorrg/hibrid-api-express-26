import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductService } from './ProductService.js'
import type { IProductRepository, IProduct, IVariantProduct } from './Product.types.js'
import type { ImageDbService } from '../images/ImageDbService.js'

describe('ProductService', () => {
  let mockRepo: IProductRepository
  let mockImageDbService: ImageDbService
  let mockDeleteOldImage: ReturnType<typeof vi.fn>
  let service: ProductService

  const sampleProduct: IProduct = {
    id: 'prod-1',
    title: 'Test Product',
    picture: 'pic1.jpg',
    logo: 'logo1.jpg',
    info_header: 'Header',
    info_body: 'Body',
    isAlive: true,
    url: 'https://test.com',
    enabled: true,
    variants: [
      {
        id: 'var-1',
        productId: 'prod-1',
        picture: 'varpic1.jpg',
        text: 'Variant 1',
        enabled: true
      }
    ]
  }

  const sampleVariant: IVariantProduct = {
    id: 'var-1',
    productId: 'prod-1',
    picture: 'varpic1.jpg',
    text: 'Variant 1',
    enabled: true
  }

  beforeEach(() => {
    mockRepo = {
      getAllProducts: vi.fn().mockResolvedValue([sampleProduct]),
      getPublicProducts: vi.fn().mockResolvedValue([sampleProduct]),
      getProductById: vi.fn().mockResolvedValue(sampleProduct),
      getPublicProductById: vi.fn().mockResolvedValue(sampleProduct),
      createProduct: vi.fn().mockImplementation(async(data) => ({
        ...data,
        id: 'prod-new',
        isAlive: data.isAlive ?? false,
        url: data.url ?? 'NoUrl',
        enabled: true
      })),
      updateProduct: vi.fn().mockImplementation(async(id, data) => ({
        ...sampleProduct,
        ...data,
        id
      })),
      deleteProduct: vi.fn().mockResolvedValue('Producto prod-1 eliminado exitosamente'),
      getVariantById: vi.fn().mockResolvedValue(sampleVariant),
      getPublicVariantById: vi.fn().mockResolvedValue(sampleVariant),
      createVariant: vi.fn().mockImplementation(async(data) => ({
        ...data,
        id: 'var-new',
        enabled: true
      })),
      updateVariant: vi.fn().mockImplementation(async(id, data) => ({
        ...sampleVariant,
        ...data,
        id
      })),
      deleteVariant: vi.fn().mockResolvedValue('Variante var-1 eliminada exitosamente')
    }

    mockImageDbService = {
      internalRemove: vi.fn().mockResolvedValue('removed'),
      save: vi.fn().mockResolvedValue(undefined)
    } as unknown as ImageDbService

    mockDeleteOldImage = vi.fn().mockResolvedValue(undefined)

    service = new ProductService(mockRepo, mockImageDbService, mockDeleteOldImage)
  })

  describe('create', () => {
    it('should create product and consume images from db gallery without deleting from storage', async() => {
      const result = await service.create({
        title: 'New',
        picture: 'newpic.jpg',
        logo: 'newlogo.jpg',
        info_header: 'Header',
        variants: [
          { picture: 'newvar.jpg', text: 'V1' }
        ]
      })

      expect(mockRepo.createProduct).toHaveBeenCalledTimes(1)
      expect(result.id).toBe('prod-new')
      // Consumed from DB
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('newpic.jpg')
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('newlogo.jpg')
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('newvar.jpg')
      // Storage untouched
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should do nothing with images if incoming URLs are identical to existing ones', async() => {
      await service.update('prod-1', {
        title: 'New Title',
        picture: 'pic1.jpg',
        logo: 'logo1.jpg',
        saver: false
      })

      expect(mockRepo.updateProduct).toHaveBeenCalledTimes(1)
      expect(mockImageDbService.internalRemove).not.toHaveBeenCalled()
      expect(mockImageDbService.save).not.toHaveBeenCalled()
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })

    it('should delete old images from storage when URLs change and saver is false', async() => {
      await service.update('prod-1', {
        picture: 'different-pic.jpg',
        logo: 'different-logo.jpg',
        saver: false
      })

      // Consumes new from DB gallery
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('different-pic.jpg')
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('different-logo.jpg')

      // Deletes old from storage
      expect(mockDeleteOldImage).toHaveBeenCalledWith('pic1.jpg')
      expect(mockDeleteOldImage).toHaveBeenCalledWith('logo1.jpg')

      // Does not save old to DB
      expect(mockImageDbService.save).not.toHaveBeenCalled()
    })

    it('should save old images to db gallery when URLs change and saver is true', async() => {
      await service.update('prod-1', {
        picture: 'different-pic.jpg',
        logo: 'different-logo.jpg',
        saver: true
      })

      // Consumes new from DB gallery
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('different-pic.jpg')
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('different-logo.jpg')

      // Saves old back into DB gallery
      expect(mockImageDbService.save).toHaveBeenCalledWith('pic1.jpg')
      expect(mockImageDbService.save).toHaveBeenCalledWith('logo1.jpg')

      // Does not delete old from storage
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })

    it('should only process changed image when body is complete but only picture changed', async() => {
      await service.update('prod-1', {
        title: 'Updated Title',
        picture: 'new-pic-only.jpg',
        logo: 'logo1.jpg', // identical to existing
        saver: true
      })

      // New picture is consumed from DB gallery
      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('new-pic-only.jpg')
      expect(mockImageDbService.internalRemove).not.toHaveBeenCalledWith('logo1.jpg')

      // Old picture is saved to DB gallery because saver is true
      expect(mockImageDbService.save).toHaveBeenCalledWith('pic1.jpg')
      expect(mockImageDbService.save).not.toHaveBeenCalledWith('logo1.jpg')

      // Neither was deleted from storage
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should delete product and delete all associated images from storage when saver is false', async() => {
      const msg = await service.delete('prod-1', false)

      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
      expect(msg).toBe('Producto prod-1 eliminado exitosamente')

      expect(mockDeleteOldImage).toHaveBeenCalledWith('pic1.jpg')
      expect(mockDeleteOldImage).toHaveBeenCalledWith('logo1.jpg')
      expect(mockDeleteOldImage).toHaveBeenCalledWith('varpic1.jpg')
      expect(mockImageDbService.save).not.toHaveBeenCalled()
    })

    it('should delete product and save all associated images to db gallery when saver is true', async() => {
      const msg = await service.delete('prod-1', true)

      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
      expect(msg).toBe('Producto prod-1 eliminado exitosamente')

      expect(mockImageDbService.save).toHaveBeenCalledWith('pic1.jpg')
      expect(mockImageDbService.save).toHaveBeenCalledWith('logo1.jpg')
      expect(mockImageDbService.save).toHaveBeenCalledWith('varpic1.jpg')
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })
  })

  describe('variant operations', () => {
    it('should consume image on createVariant', async() => {
      await service.createVariant({
        productId: 'prod-1',
        picture: 'newvarpic.jpg',
        text: 'V'
      })

      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('newvarpic.jpg')
    })

    it('should do nothing with variant image if update has identical picture', async() => {
      await service.updateVariant('var-1', {
        picture: 'varpic1.jpg',
        text: 'Updated Text'
      })

      expect(mockImageDbService.internalRemove).not.toHaveBeenCalled()
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })

    it('should delete old variant image from storage when updated with different picture and saver is false', async() => {
      await service.updateVariant('var-1', {
        picture: 'changedvarpic.jpg',
        saver: false
      })

      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('changedvarpic.jpg')
      expect(mockDeleteOldImage).toHaveBeenCalledWith('varpic1.jpg')
    })

    it('should save old variant image to db gallery when updated with different picture and saver is true', async() => {
      await service.updateVariant('var-1', {
        picture: 'changedvarpic.jpg',
        saver: true
      })

      expect(mockImageDbService.internalRemove).toHaveBeenCalledWith('changedvarpic.jpg')
      expect(mockImageDbService.save).toHaveBeenCalledWith('varpic1.jpg')
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
    })

    it('should delete variant and delete its image when saver is false', async() => {
      const msg = await service.deleteVariant('var-1', false)

      expect(mockRepo.deleteVariant).toHaveBeenCalledWith('var-1')
      expect(mockDeleteOldImage).toHaveBeenCalledWith('varpic1.jpg')
      expect(msg).toBe('Variante var-1 eliminada exitosamente')
    })

    it('should delete variant and save its image to db gallery when saver is true', async() => {
      const msg = await service.deleteVariant('var-1', true)

      expect(mockRepo.deleteVariant).toHaveBeenCalledWith('var-1')
      expect(mockImageDbService.save).toHaveBeenCalledWith('varpic1.jpg')
      expect(mockDeleteOldImage).not.toHaveBeenCalled()
      expect(msg).toBe('Variante var-1 eliminada exitosamente')
    })
  })

  describe('Promise.allSettled error handling', () => {
    it('should complete create even if consuming an image fails, logging a warning', async() => {
      (mockImageDbService.internalRemove as any).mockRejectedValueOnce(new Error('DB failure'))

      const result = await service.create({
        title: 'New Product',
        picture: 'fail-pic.jpg',
        logo: 'logo.jpg',
        info_header: 'Header'
      })

      expect(result.id).toBe('prod-new')
      expect(mockRepo.createProduct).toHaveBeenCalledTimes(1)
    })

    it('should complete delete even if deleting storage image fails, logging an error', async() => {
      mockDeleteOldImage.mockRejectedValueOnce(new Error('Storage failure'))

      const msg = await service.delete('prod-1', false)

      expect(msg).toBe('Producto prod-1 eliminado exitosamente')
      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
    })
  })
})
