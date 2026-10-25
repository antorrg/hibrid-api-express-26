import fs from 'fs/promises'
import path from 'node:path'
import envConfig from '../../../configs/envConfig.js'
import { ERROR_CODE, throwError } from '../../../configs/errors.js'
import { type UploadedImageFile } from '../../interfaces/base.interface.js'

const localBaseUrl = `http://localhost:${envConfig.Port}`

export class MockImageService {
  static #uploadDirectory = `./${envConfig.BaseTestUrl}`

  static uploadImage = async(file: UploadedImageFile): Promise<string> => {
    const uploadDir = MockImageService.#uploadDirectory
    // Asegurarse de que existe la carpeta
    await fs.mkdir(uploadDir, { recursive: true })
    const newImagePath = path.join(uploadDir, file.originalname)
    await fs.writeFile(newImagePath, file.buffer)
    return `${localBaseUrl}/${envConfig.BaseTestUrl}/${file.originalname}`
  }

  static deleteImage = async(imageUrl: string) => {
    const filename = path.basename(imageUrl)
    if (!path.extname(filename)) {
      throw new Error(`Url invalida, no contiene archivo: ${imageUrl}`)
    }
    const filePath = path.join(MockImageService.#uploadDirectory, filename)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await fs.unlink(filePath)
      return `Imagen "${filePath}" borrada exitosamente`
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return `Imagen "${filePath}" fue borrada o no existe`
      }
      throwError(ERROR_CODE.FILE_DELETE_FAILED, 'Error borrando imagen')
    }
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string'
}
