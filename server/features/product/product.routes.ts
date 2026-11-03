import express from 'express'
import { Validator } from 'req-valid-express'
import { create, update } from './validationSchemas/productschemas.js'
import { itemCreate, itemUpdate } from './validationSchemas/itemSchemas.js'
import { authorizeMinRole, UserRole } from '../../shared/auth/authMiddlewares.js'
import { productService } from '../../shared/dependencies.js'
import { ProductController } from './ProductController.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { sanitizeRichText, sanitizeArrayRichText } from '../../shared/middlewares/sanitizeRichText.js'

const controller = new ProductController(productService)
const productRouter = express.Router()

// --- Rutas de Productos ---
productRouter.get(
  '/',
  controller.getAll
)

productRouter.get(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.getById
)

productRouter.post(
  '/',
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateBody(create),
  sanitizeArrayRichText(['text'], ['variants', 'items']),
  controller.create
)

productRouter.put(
  '/:id',
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(update),
  controller.update
)

productRouter.delete(
  '/:id',
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.delete
)

// --- Rutas de Variantes / Ítems ---
productRouter.get(
  '/variant/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.getVariant
)

productRouter.post(
  '/variant',
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateBody(itemCreate),
  sanitizeRichText(['text']),
  controller.createVariant
)

productRouter.put(
  '/variant/:id',
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(itemUpdate),
  sanitizeRichText(['text']),
  controller.updateVariant
)

productRouter.delete(
  '/variant/:id',
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.deleteVariant
)
export default productRouter
