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
import type { ImageDbService } from '../images/ImageDbService.js'

describe('ProductService', () => {
  let mockRepo: IProductRepository
  let mockImageDbService: ImageDbService
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


    mockImageDbService = {
      consumeImage: vi.fn().mockResolvedValue(undefined),
      handleReplacedImage: vi.fn().mockResolvedValue(undefined),
      handleDeletedImage: vi.fn().mockResolvedValue(undefined)
    } as unknown as ImageDbService

    service = new ProductService(mockRepo, mockImageDbService)
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
      expect(mockImageDbService.consumeImage).toHaveBeenCalledWith('newpic.jpg')
      expect(mockImageDbService.consumeImage).toHaveBeenCalledWith('newlogo.jpg')
      expect(mockImageDbService.consumeImage).toHaveBeenCalledWith('newvar.jpg')
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
      expect(mockImageDbService.handleReplacedImage).not.toHaveBeenCalled()
    })

    it('should delegate image replacement to imageDbService when URLs change (saver=false)', async() => {
      await service.update('prod-1', {
        picture: 'different-pic.jpg',
        logo: 'different-logo.jpg',
        saver: false
      })

      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('pic1.jpg', 'different-pic.jpg', false)
      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('logo1.jpg', 'different-logo.jpg', false)
    })

    it('should delegate image replacement to imageDbService when URLs change (saver=true)', async() => {
      await service.update('prod-1', {
        picture: 'different-pic.jpg',
        logo: 'different-logo.jpg',
        saver: true
      })

      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('pic1.jpg', 'different-pic.jpg', true)
      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('logo1.jpg', 'different-logo.jpg', true)
    })

    it('should only process changed image when body is complete but only picture changed', async() => {
      await service.update('prod-1', {
        title: 'Updated Title',
        picture: 'new-pic-only.jpg',
        logo: 'logo1.jpg', // identical to existing
        saver: true
      })

      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('pic1.jpg', 'new-pic-only.jpg', true)
      expect(mockImageDbService.handleReplacedImage).not.toHaveBeenCalledWith('logo1.jpg', 'logo1.jpg', expect.anything())
    })
  })

  describe('delete', () => {
    it('should delete product and delegate image deletion to imageDbService (saver=false)', async() => {
      const msg = await service.delete('prod-1', false)

      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
      expect(msg).toBe('Producto prod-1 eliminado exitosamente')

      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('pic1.jpg', false)
      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('logo1.jpg', false)
      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', false)
    })

    it('should delete product and delegate image deletion to imageDbService (saver=true)', async() => {
      const msg = await service.delete('prod-1', true)

      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
      expect(msg).toBe('Producto prod-1 eliminado exitosamente')

      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('pic1.jpg', true)
      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('logo1.jpg', true)
      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', true)
    })
  })

  describe('variant operations', () => {
    it('should consume image on createVariant', async() => {
      await service.createVariant({
        productId: 'prod-1',
        picture: 'newvarpic.jpg',
        text: 'V'
      })

      expect(mockImageDbService.consumeImage).toHaveBeenCalledWith('newvarpic.jpg')
    })

    it('should do nothing with variant image if update has identical picture', async() => {
      await service.updateVariant('var-1', {
        picture: 'varpic1.jpg',
        text: 'Updated Text'
      })

      expect(mockImageDbService.handleReplacedImage).not.toHaveBeenCalled()
    })

    it('should delegate variant image replacement to imageDbService (saver=false)', async() => {
      await service.updateVariant('var-1', {
        picture: 'changedvarpic.jpg',
        saver: false
      })

      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('varpic1.jpg', 'changedvarpic.jpg', false)
    })

    it('should delegate variant image replacement to imageDbService (saver=true)', async() => {
      await service.updateVariant('var-1', {
        picture: 'changedvarpic.jpg',
        saver: true
      })

      expect(mockImageDbService.handleReplacedImage).toHaveBeenCalledWith('varpic1.jpg', 'changedvarpic.jpg', true)
    })

    it('should delete variant and delegate image deletion to imageDbService (saver=false)', async() => {
      const msg = await service.deleteVariant('var-1', false)

      expect(mockRepo.deleteVariant).toHaveBeenCalledWith('var-1')
      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', false)
      expect(msg).toBe('Variante var-1 eliminada exitosamente')
    })

    it('should delete variant and delegate image deletion to imageDbService (saver=true)', async() => {
      const msg = await service.deleteVariant('var-1', true)

      expect(mockRepo.deleteVariant).toHaveBeenCalledWith('var-1')
      expect(mockImageDbService.handleDeletedImage).toHaveBeenCalledWith('varpic1.jpg', true)
      expect(msg).toBe('Variante var-1 eliminada exitosamente')
    })
  })

  describe('Promise.allSettled error handling', () => {
    it('should complete create even if consuming an image fails, logging a warning', async() => {
      (mockImageDbService.consumeImage as any).mockRejectedValueOnce(new Error('DB failure'))

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
      (mockImageDbService.handleDeletedImage as any).mockRejectedValueOnce(new Error('Storage failure'))

      const msg = await service.delete('prod-1', false)

      expect(msg).toBe('Producto prod-1 eliminado exitosamente')
      expect(mockRepo.deleteProduct).toHaveBeenCalledWith('prod-1')
    })
  })
})

