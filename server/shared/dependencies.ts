import { UserRepository } from '../features/user/UserRepository.js'
import { UserService } from '../features/user/UserService.js'
import { imageService } from './externals/images/ImageService.js'
import { Image, Client, ApiKey, Letter, Product, VariantProduct } from '../configs/database.js'
import { ImageDbRepository } from '../features/images/ImageDbRepository.js'
import { ImageDbService } from '../features/images/ImageDbService.js'
import { ApiKeyRepository } from '../features/apiKey/ApiKeyRepository.js'
import { ApiKeyService } from '../features/apiKey/ApiKeyService.js'
import { ApiMiddlewares } from '../features/apiKey/apiKeyMiddleware.js'
import { LetterRepository } from '../features/cartas/LetterRepository.js'
import { LetterService } from '../features/cartas/LetterService.js'
import { emailService } from './externals/EmailService/EmailService.js'
import { ProductRepository } from '../features/product/ProductRepository.js'
import { ProductService } from '../features/product/ProductService.js'

const imgrepo = new ImageDbRepository(Image)
export const imageDbService = new ImageDbService(imgrepo, imageService.deleteOldImage)

export const userRepository = new UserRepository()
export const userService = new UserService(userRepository, imageService.deleteOldImage)

export const apiKeyRepository = new ApiKeyRepository(Client, ApiKey)
export const apiKeyService = new ApiKeyService(apiKeyRepository, true)
export const apiMiddleware = new ApiMiddlewares(apiKeyService.apiKeyVerify.bind(apiKeyService))

export const letterRepository = new LetterRepository(Letter)
export const letterService = new LetterService(letterRepository, emailService.sendEmail.bind(emailService))

export const productRepository = new ProductRepository(Product, VariantProduct)
export const productService = new ProductService(productRepository, imageDbService, imageService.deleteOldImage)