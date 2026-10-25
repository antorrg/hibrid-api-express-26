import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { startUp, closeDatabase, Product, VariantProduct } from '../../configs/database.js'
import { ProductRepository } from './ProductRepository.js'
import type { CreateProductDTO } from './Product.types.js'

describe('ProductRepository Integration Tests', () => {
  let repo: ProductRepository

  beforeAll(async() => {
    await startUp(true, true)
    repo = new ProductRepository(Product, VariantProduct)
  })

  afterAll(async() => {
    await closeDatabase()
  })

  describe('Product Atomic Creation', () => {
    it('should create a product with variants in a single transaction', async() => {
      const data: CreateProductDTO = {
        title: 'Test Product',
        picture: 'prod-pic.jpg',
        logo: 'prod-logo.jpg',
        info_header: 'Header',
        info_body: 'Body',
        variants: [
          { text: 'Variant 1', picture: 'pic1.jpg' },
          { text: 'Variant 2', picture: 'pic2.jpg' }
        ]
      }

      const created = await repo.createProduct(data)

      expect(created.title).toBe('Test Product')
      expect(created.logo).toBe('prod-logo.jpg')
      expect(created.variants).toHaveLength(2)
      expect(created.variants![0].text).toBe('Variant 1')
      expect(created.variants![0].productId).toBe(created.id)
    })
  })

  describe('Read Operations', () => {
    it('should return products in list view without variants', async() => {
      const list = await repo.getAllProducts()
      expect(list.length).toBeGreaterThan(0)
      expect(list[0]).not.toHaveProperty('variants')
    })

    it('should return product with variants in detail view', async() => {
      const all = await repo.getAllProducts()
      const id = all[0].id

      const product = await repo.getProductById(id)
      expect(product.id).toBe(id)
      expect(product.variants).toBeDefined()
      expect(Array.isArray(product.variants)).toBe(true)
    })

    it('should filter enabled products in public view', async() => {
      const publicList = await repo.getPublicProducts()
      expect(publicList.every(p => p.enabled === true)).toBe(true)
    })
  })

  describe('Update and Delete', () => {
    it('should update product fields', async() => {
      const all = await repo.getAllProducts()
      const id = all[0].id

      const updated = await repo.updateProduct(id, { title: 'Updated Title' })
      expect(updated.title).toBe('Updated Title')
    })

    it('should delete product and cascade delete its variants', async() => {
      const data: CreateProductDTO = {
        title: 'To Be Deleted',
        picture: 'del.jpg',
        logo: 'dellogo.jpg',
        info_header: 'H',
        info_body: 'B',
        variants: [{ text: 'Will be gone', picture: 'var.jpg' }]
      }
      const created = await repo.createProduct(data)
      const productId = created.id
      const variantId = created.variants![0].id

      const deleteMsg = await repo.deleteProduct(productId)
      expect(deleteMsg).toContain('eliminado exitosamente')

      await expect(repo.getProductById(productId)).rejects.toThrow('no encontrado')
      await expect(repo.getVariantById(variantId)).rejects.toThrow('no encontrada')
    })
  })

  describe('Individual Variant Management', () => {
    it('should create an individual variant for an existing product', async() => {
      const all = await repo.getAllProducts()
      const productId = all[0].id

      const created = await repo.createVariant({
        text: 'New Single Variant',
        picture: 'single.jpg',
        productId
      })

      expect(created.text).toBe('New Single Variant')
      expect(created.productId).toBe(productId)
    })

    it('should update and delete an individual variant', async() => {
      const all = await repo.getAllProducts()
      const product = await repo.getProductById(all[0].id)
      const variantId = product.variants![0].id

      const updated = await repo.updateVariant(variantId, { text: 'Updated Variant Text' })
      expect(updated.text).toBe('Updated Variant Text')

      const deleteMsg = await repo.deleteVariant(variantId)
      expect(deleteMsg).toContain('eliminada exitosamente')

      await expect(repo.getVariantById(variantId)).rejects.toThrow('no encontrada')
    })
  })
})
