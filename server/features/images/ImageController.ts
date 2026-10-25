import type { Request, Response } from 'express'
import multer from 'multer'
import { responder } from '../../shared/utils/responder.js'
import type { UploadedImageFile } from '../../shared/interfaces/base.interface.js'
import type { ImageDbService } from './ImageDbService.js'
import type { ImageQueries } from './Image.types.js'
import { ERROR_CODE, throwError } from '../../configs/errors.js'

const storage = multer.memoryStorage()
export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Formato de imagen no permitido'))
  }
})

export class ImageController {
  private readonly imageService: (file: UploadedImageFile) => Promise<string | undefined>
  private readonly imageDbService: ImageDbService

  constructor(
    imageService: (file: UploadedImageFile) => Promise<string | undefined>,
    imageDbService: ImageDbService
  ) {
    this.imageService = imageService
    this.imageDbService = imageDbService
  }

  uploader = async(req: Request, res: Response) => {
    const file = req.file
    if (!file) {
      throwError(ERROR_CODE.FILE_REQUIRED, 'No hay Imagen')
    }
    const result = await this.imageService(file!)
    if (!result) {
      throwError(ERROR_CODE.OPERATION_FAILED, 'Fallo subida de imagen')
    }
    await this.imageDbService.save(result)
    return responder(res, 201, result)
  }

  getImages = async(req: Request, res: Response) => {
    const queries = (req.context?.query ?? req.query) as ImageQueries
    const result = await this.imageDbService.getWithPages(queries)
    return responder(res, 200, result)
  }

  deleteImage = async(req: Request, res: Response) => {
    const { id } = req.params
    const result = await this.imageDbService.remove(id as string)
    return responder(res, 200, result)
  }
}