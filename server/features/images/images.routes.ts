import express from 'express'
import { fileStorageService } from '../../shared/externals/images/FileStorageService.js'
import { imageService } from '../../shared/dependencies.js'
import { ImageController, uploadImage } from './ImageController.js'
import { Validator } from 'req-valid-express'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { imageQuery } from './validationSchemas.js'

const imageController = new ImageController(fileStorageService.uploadNewImage, imageService)

const imageRouter = express.Router()

imageRouter.post(
  '/upload',
  uploadImage.single('image'),
  imageController.uploader
)

imageRouter.get(
  '/',
  Validator.validateQuery(imageQuery, {
    order: ['ASC', 'DESC']
  }),
  imageController.getImages
)

imageRouter.delete(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  imageController.deleteImage
)

export default imageRouter