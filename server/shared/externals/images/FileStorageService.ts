import { MockImageService } from './MockImageService.js'
import { uploadImageToFirebase, deleteImageFromStorage } from './firebase.js'
import { type UploadedImageFile } from '../../interfaces/base.interface.js'
import envConfig from '../../../configs/envConfig.js'
import { ERROR_CODE, throwError } from '../../../configs/errors.js'

const uploadImage = envConfig.Status === 'production'? uploadImageToFirebase : MockImageService.uploadImage
const deleteImage = envConfig.Status === 'production'? deleteImageFromStorage : MockImageService.deleteImage


export class FileStorageService {
  protected uploadImage: (file: UploadedImageFile) => Promise<string | undefined>
  protected deleteImage: (url: string) => Promise<string | undefined>
  constructor(
    uploadImage: (file: UploadedImageFile) => Promise<string | undefined>, 
    deleteImage: (url: string) => Promise<string | undefined>
  ) {
    this.uploadImage = uploadImage
    this.deleteImage = deleteImage
  }
  #whiteList = [`${envConfig.UserImg}`]

  uploadNewImage = async(file: UploadedImageFile) => {
    const exceptImage = this.#whiteList.includes(file.originalname)
    if (exceptImage) {
      throwError(ERROR_CODE.DATA_CONFLICT, 'La imagen ya existe')
    }
    return await this.uploadImage(file)
  }

  deleteOldImage = async(imageUrl: string) => {
    const exceptImage = this.#whiteList.includes(imageUrl)
    if (exceptImage) {
      return `La imagen "${imageUrl}" no se puede eliminar`
    }
    return await this.deleteImage(imageUrl)
  }
}

export const fileStorageService = new FileStorageService(uploadImage, deleteImage)