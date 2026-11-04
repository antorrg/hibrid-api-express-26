import { UserRepository } from '../features/user/UserRepository.js'
import { UserService } from '../features/user/UserService.js'
import { fileStorageService } from './externals/images/FileStorageService.js'
import { Image, Client, ApiKey, Letter, Product, VariantProduct, FrontPage, About } from '../configs/database.js'
import { ImageRepository } from '../features/images/ImageRepository.js'
import { ImageService } from '../features/images/ImageService.js'
import { ApiKeyRepository } from '../features/apiKey/ApiKeyRepository.js'
import { ApiKeyService } from '../features/apiKey/ApiKeyService.js'
import { ApiMiddlewares } from '../features/apiKey/apiKeyMiddleware.js'
import { LetterRepository } from '../features/cartas/LetterRepository.js'
import { LetterService } from '../features/cartas/LetterService.js'
import { emailService } from './externals/EmailService/EmailService.js'
import { ProductRepository } from '../features/product/ProductRepository.js'
import { ProductService } from '../features/product/ProductService.js'
import { BaseRepository } from './repositories/BaseRepository.js'
import { FrontPageService } from '../features/frontPage/FrontPageService.js'
import { frontPageParser, type IFrontCreate, type IFrontPage, type IFrotnUpdate } from '../features/frontPage/FrontPage.types.js'
import { VideoRepository } from '../features/videos/VideoRepository.js'
import { VideosService } from '../features/videos/VideosService.js'
import { aboutParser, type IAbout, type IAboutCreate, type IAboutUpdate } from '../features/about/About.types.js'
import { AboutService } from '../features/about/AboutService.js'
import sessionAdapter from './auth/session/connect-db.js'

export const imageRepository = new ImageRepository(Image)
export const imageService = new ImageService(imageRepository, fileStorageService.deleteOldImage)
export const imageDbService = imageService

const userRepository = new UserRepository()
export const userService = new UserService(
  userRepository,
  fileStorageService.deleteOldImage,
  (userId: string) => sessionAdapter.destroyByUserId(userId)
)

const apiKeyRepository = new ApiKeyRepository(Client, ApiKey)
export const apiKeyService = new ApiKeyService(apiKeyRepository, true)
export const apiMiddleware = new ApiMiddlewares(apiKeyService.apiKeyVerify.bind(apiKeyService))

const letterRepository = new LetterRepository(Letter)
export const letterService = new LetterService(letterRepository, emailService.sendEmail.bind(emailService))

//products
const productRepository = new ProductRepository(Product, VariantProduct)
export const productService = new ProductService(productRepository, imageService)

// FrontPage
const frontPageRepository = new BaseRepository<IFrontPage, IFrontCreate, IFrotnUpdate>(
  FrontPage,
  frontPageParser,
  frontPageParser,
  'FrontPage'
)
export const frontPageService = new FrontPageService(frontPageRepository, imageService)

//Videos

export const videoRepository = new VideoRepository()
export const videoService = new VideosService(videoRepository)

// About

const aboutRepository = new BaseRepository<IAbout, IAboutCreate, IAboutUpdate>(
  About, 
  aboutParser,
  aboutParser,
  'About'
)
export const aboutService = new AboutService(aboutRepository, imageDbService)

