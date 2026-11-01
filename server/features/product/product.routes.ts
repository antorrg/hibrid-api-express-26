import express from 'express'
import { Validator } from 'req-valid-express'
import { create, update } from './validationSchemas/productschemas.js'
import { itemCreate, itemUpdate } from './validationSchemas/itemSchemas.js'
import { isAuthenticated, authorizeMinRole, UserRole } from '../../shared/auth/authMiddlewares.js'
import { productService } from '../../shared/dependencies.js'
import { ProductController } from './ProductController.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { sanitizeRichText, sanitizeArrayRichText } from '../../shared/middlewares/sanitizeRichText.js'

const controller = new ProductController(productService)
const productRouter = express.Router()

// --- Rutas Públicas ---
productRouter.get('/public', controller.scopedGet)
productRouter.get('/public/:id', Validator.paramId('id', UuidHandler.uuidRegex), controller.scopedGetById)
productRouter.get('/public/variant/:id', Validator.paramId('id', UuidHandler.uuidRegex), controller.scopedGetVariant)
productRouter.get('/public/item/:id', Validator.paramId('id', UuidHandler.uuidRegex), controller.scopedGetVariant)

// --- Rutas de Productos ---
productRouter.get(
  '/',
  //isAuthenticated,
  controller.getAll
)

productRouter.get(
  '/:id',
  //isAuthenticated,
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.getById
)

productRouter.post(
  '/',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateBody(create),
  sanitizeArrayRichText(['text'], ['variants', 'items']),
  controller.create
)

productRouter.put(
  '/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(update),
  controller.update
)

productRouter.delete(
  '/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.delete
)

// --- Rutas de Variantes / Ítems ---
productRouter.get(
  '/variant/:id',
  isAuthenticated,
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.getVariant
)

productRouter.post(
  '/variant',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.validateBody(itemCreate),
  sanitizeRichText(['text']),
  controller.createVariant
)

productRouter.put(
  '/variant/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(itemUpdate),
  sanitizeRichText(['text']),
  controller.updateVariant
)

productRouter.delete(
  '/variant/:id',
  isAuthenticated,
  authorizeMinRole(UserRole.ADMIN),
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.deleteVariant
)
export default productRouter
