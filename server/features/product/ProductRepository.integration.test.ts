import { beforeAll, describe, it, expect } from 'vitest'
import { Product, VariantProduct } from '../../configs/database.js'
import { ProductRepository } from './ProductRepository.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import type { ProductCreationAttributes } from './Product.types.js'

describe('ProductRepository Integration Tests', () => {
  let repo: ProductRepository

  beforeAll(() => {
    repo = new ProductRepository(Product, VariantProduct)
  })

  describe('Product Atomic Creation', () => {
    it('should create a product with variants in a single transaction', async() => {
      const productId = UuidHandler.createUuid()
      const data: ProductCreationAttributes = {
        id: productId,
        title: 'Test Product',
        picture: 'prod-pic.jpg',
        logo: 'prod-logo.jpg',
        info_header: 'Header',
        info_body: 'Body',
        isAlive: false,
        url: 'NoUrl',
        enabled: true,
        variants: [
          { id: UuidHandler.createUuid(), productId, text: 'Variant 1', picture: 'pic1.jpg', enabled: true },
          { id: UuidHandler.createUuid(), productId, text: 'Variant 2', picture: 'pic2.jpg', enabled: true }
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

    it('should return public products with bounded fields and without enabled or variants', async() => {
      const publicList = await repo.getPublicProducts()
      expect(publicList.length).toBeGreaterThan(0)
      const first = publicList[0]
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('title')
      expect(first).toHaveProperty('logo')
      expect(first).toHaveProperty('picture')
      expect(first).toHaveProperty('url')
      expect(first).toHaveProperty('isAlive')
      expect(first).toHaveProperty('info_header')
      expect(first).toHaveProperty('info_body')
      expect(first).not.toHaveProperty('enabled')
      expect(first).not.toHaveProperty('createdAt')
      expect(first).not.toHaveProperty('updatedAt')
      expect(first).not.toHaveProperty('variants')
    })

    it('should return public product by id with bounded product and variant fields', async() => {
      const all = await repo.getAllProducts()
      const id = all[0].id

      const publicProduct = await repo.getPublicProductById(id)
      expect(publicProduct.id).toBe(id)
      expect(publicProduct).toHaveProperty('title')
      expect(publicProduct).toHaveProperty('logo')
      expect(publicProduct).toHaveProperty('picture')
      expect(publicProduct).toHaveProperty('url')
      expect(publicProduct).toHaveProperty('isAlive')
      expect(publicProduct).toHaveProperty('info_header')
      expect(publicProduct).toHaveProperty('info_body')
      expect(publicProduct).not.toHaveProperty('enabled')
      expect(publicProduct).not.toHaveProperty('createdAt')

      expect(publicProduct.variants).toBeDefined()
      expect(publicProduct.variants.length).toBeGreaterThan(0)
      const variant = publicProduct.variants[0]
      expect(variant).toHaveProperty('id')
      expect(variant).toHaveProperty('productId')
      expect(variant).toHaveProperty('picture')
      expect(variant).toHaveProperty('text')
      expect(variant).not.toHaveProperty('enabled')
      expect(variant).not.toHaveProperty('createdAt')
    })

    it('should return public variant by id with id, productId, text, picture', async() => {
      const all = await repo.getAllProducts()
      const product = await repo.getProductById(all[0].id)
      const variant = product.variants![0]

      const publicVariant = await repo.getPublicVariantById(variant.id)
      expect(publicVariant).toEqual({
        id: variant.id,
        productId: product.id,
        text: variant.text,
        picture: variant.picture
      })
      expect(publicVariant).not.toHaveProperty('enabled')
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
      const delProductId = UuidHandler.createUuid()
      const data: ProductCreationAttributes = {
        id: delProductId,
        title: 'To Be Deleted',
        picture: 'del.jpg',
        logo: 'dellogo.jpg',
        info_header: 'H',
        info_body: 'B',
        isAlive: false,
        url: 'NoUrl',
        enabled: true,
        variants: [{ id: UuidHandler.createUuid(), productId: delProductId, text: 'Will be gone', picture: 'var.jpg', enabled: true }]
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
        id: UuidHandler.createUuid(),
        text: 'New Single Variant',
        picture: 'single.jpg',
        productId,
        enabled: true
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
