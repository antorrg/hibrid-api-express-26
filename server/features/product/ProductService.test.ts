import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProductService } from './ProductService.js'
import type {
  IProductRepository,
  IProduct,
  IVariantProduct,
  IProductPublicSummary,
  IProductPublicDetail,
  IVariantSinglePublic
} from './Product.types.js'
import type { ImageService } from '../images/ImageService.js'

describe('ProductService', () => {
  let mockRepo: IProductRepository
  let mockImageService: ImageService
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

  const samplePublicSummary: IProductPublicSummary = {
    id: 'prod-1',
    title: 'Test Product',
    logo: 'logo1.jpg',
    picture: 'pic1.jpg',
    url: 'https://test.com',
    isAlive: true,
    info_header: 'Header',
    info_body: 'Body'
  }

  const samplePublicDetail: IProductPublicDetail = {
    ...samplePublicSummary,
    variants: [
      {
        id: 'var-1',
        productId: 'prod-1',
        picture: 'varpic1.jpg',
        text: 'Variant 1'
      }
    ]
  }

  const samplePublicVariant: IVariantSinglePublic = {
    id: 'var-1',
    productId: 'prod-1',
    text: 'Variant 1',
    picture: 'varpic1.jpg'
  }


  beforeEach(() => {
    mockRepo = {
      getAllProducts: vi.fn().mockResolvedValue([sampleProduct]),
      getPublicProducts: vi.fn().mockResolvedValue([samplePublicSummary]),
      getProductById: vi.fn().mockResolvedValue(sampleProduct),
      getPublicProductById: vi.fn().mockResolvedValue(samplePublicDetail),
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
      getPublicVariantById: vi.fn().mockResolvedValue(samplePublicVariant),
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


    mockImageService = {
      consumeImage: vi.fn().mockResolvedValue(undefined),
      handleReplacedImage: vi.fn().mockResolvedValue(undefined),
      handleDeletedImage: vi.fn().mockResolvedValue(undefined)
    } as unknown as ImageService

    service = new ProductService(mockRepo, mockImageService)
  })

  describe('create', () => {
    it('should create product and consume images via imageDbService', async() => {
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
      expect(mockImageService.consumeImage).toHaveBeenCalledWith('newpic.jpg')
      expect(mockImageService.consumeImage).toHaveBeenCalledWith('newlogo.jpg')
      expect(mockImageService.consumeImage).toHaveBeenCalledWith('newvar.jpg')
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
      expect(mockImageService.handleReplacedImage).not.toHaveBeenCalled()
    })

    it('should delegate image replacement to imageDbService when URLs change (saver=false)', async() => {
      await service.update('prod-1', {
        picture: 'different-pic.jpg',
        logo: 'different-logo.jpg',
        saver: false
      })

      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('pic1.jpg', 'different-pic.jpg', false)
      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('logo1.jpg', 'different-logo.jpg', false)
    })

    it('should delegate image replacement to imageDbService when URLs change (saver=true)', async() => {
      await service.update('prod-1', {
        picture: 'different-pic.jpg',
        logo: 'different-logo.jpg',
        saver: true
      })

      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('pic1.jpg', 'different-pic.jpg', true)
      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('logo1.jpg', 'different-logo.jpg', true)
    })

    it('should only process changed image when body is complete but only picture changed', async() => {
      await service.update('prod-1', {
        title: 'Updated Title',
        picture: 'new-pic-only.jpg',
        logo: 'logo1.jpg', // identical to existing
        saver: true
      })

      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('pic1.jpg', 'new-pic-only.jpg', true)
      expect(mockImageService.handleReplacedImage).not.toHaveBeenCalledWith('logo1.jpg', 'logo1.jpg', expect.anything())
    })
  })

  describe('delete', () => {
    it('should delete product and delegate image deletion to imageDbService (saver=false)', async() => {
      const msg = await service.delete('prod-1', false)

      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
      expect(msg).toBe('Producto prod-1 eliminado exitosamente')

      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('pic1.jpg', false)
      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('logo1.jpg', false)
      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', false)
    })

    it('should delete product and delegate image deletion to imageDbService (saver=true)', async() => {
      const msg = await service.delete('prod-1', true)

      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
      expect(msg).toBe('Producto prod-1 eliminado exitosamente')

      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('pic1.jpg', true)
      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('logo1.jpg', true)
      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', true)
    })
  })

  describe('variant operations', () => {
    it('should consume image on createVariant', async() => {
      await service.createVariant({
        productId: 'prod-1',
        picture: 'newvarpic.jpg',
        text: 'V'
      })

      expect(mockImageService.consumeImage).toHaveBeenCalledWith('newvarpic.jpg')
    })

    it('should do nothing with variant image if update has identical picture', async() => {
      await service.updateVariant('var-1', {
        picture: 'varpic1.jpg',
        text: 'Updated Text'
      })

      expect(mockImageService.handleReplacedImage).not.toHaveBeenCalled()
    })

    it('should delegate variant image replacement to imageDbService (saver=false)', async() => {
      await service.updateVariant('var-1', {
        picture: 'changedvarpic.jpg',
        saver: false
      })

      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('varpic1.jpg', 'changedvarpic.jpg', false)
    })

    it('should delegate variant image replacement to imageDbService (saver=true)', async() => {
      await service.updateVariant('var-1', {
        picture: 'changedvarpic.jpg',
        saver: true
      })

      expect(mockImageService.handleReplacedImage).toHaveBeenCalledWith('varpic1.jpg', 'changedvarpic.jpg', true)
    })

    it('should delete variant and delegate image deletion to imageDbService (saver=false)', async() => {
      const msg = await service.deleteVariant('var-1', false)

      expect(mockRepo.deleteVariant).toHaveBeenCalledWith('var-1')
      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', false)
      expect(msg).toBe('Variante var-1 eliminada exitosamente')
    })

    it('should delete variant and delegate image deletion to imageDbService (saver=true)', async() => {
      const msg = await service.deleteVariant('var-1', true)

      expect(mockRepo.deleteVariant).toHaveBeenCalledWith('var-1')
      expect(mockImageService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', true)
      expect(msg).toBe('Variante var-1 eliminada exitosamente')
    })
  })

  describe('Promise.allSettled error handling', () => {
    it('should complete create even if consuming an image fails, logging a warning', async() => {
      (mockImageService.consumeImage as any).mockRejectedValueOnce(new Error('DB failure'))

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
      (mockImageService.handleDeletedImage as any).mockRejectedValueOnce(new Error('Storage failure'))

      const msg = await service.delete('prod-1', false)

      expect(msg).toBe('Producto prod-1 eliminado exitosamente')
      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
    })
  })
})

