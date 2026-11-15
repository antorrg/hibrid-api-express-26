import envConfig from '../../../configs/envConfig.js'
import { ERROR_CODE, throwError } from '../../../configs/errors.js'
import { type UploadedImageFile } from '../../interfaces/base.interface.js'
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getStorage, getDownloadURL } from 'firebase-admin/storage'

const getStorageBucket = () => {
  const app = getApps().length > 0
    ? getApp()
    : initializeApp({
      credential: cert({
        projectId: envConfig.FirePId,
        clientEmail: envConfig.FireClientEmail,
        privateKey: envConfig.FirePrivateKey
      }),
      storageBucket: envConfig.FireStoreBuck
    })

  return getStorage(app).bucket()
}

// Funciones de subida y borrado de imagenes:

const uploadImageToFirebase = async(file: UploadedImageFile) => {
  try {
    const bucket = getStorageBucket()

    // Prefijo compacto único (timestamp base36, ~8 chars) para evitar colisiones sin inflar la URL
    const compactPrefix = Date.now().toString(36)
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${compactPrefix}-${sanitizedFilename}`

    // Crear una referencia al archivo en Firebase Storage
    const fileRef = bucket.file(`imagesApi/${fileName}`)

    // Subir el archivo a Firebase Storage
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype
      },
      resumable: false
    })

    // Obtener la URL de descarga pública con token
    const downloadURL = await getDownloadURL(fileRef)

    return downloadURL
  } catch (error) {
    console.error('Error al subir la imagen a Firebase:', error)
    throwError(ERROR_CODE.OPERATION_FAILED, 'Error al subir imagen')
  }
}

const deleteImageFromStorage = async(imageUrl: string) => {
  try {
    const bucket = getStorageBucket()

    // Extrae la ruta relativa del archivo desde la URL completa
    const bucketBaseUrl = 'https://firebasestorage.googleapis.com/v0/b/'
    const storageBucket = envConfig.FireStoreBuck

    if (!imageUrl.startsWith(`${bucketBaseUrl}${storageBucket}`)) {
      throw new Error('La URL no pertenece al bucket de Firebase configurado.')
    }

    const filePath = decodeURIComponent(
      imageUrl
        .replace(`${bucketBaseUrl}${storageBucket}/o/`, '')
        .split('?')[0]
    )

    // Crea una referencia al archivo en Firebase Storage
    const fileRef = bucket.file(filePath)

    // Elimina el archivo (ignoreNotFound asegura idempotencia si ya fue borrado)
    await fileRef.delete({ ignoreNotFound: true })
    console.log(`Imagen eliminada correctamente: ${filePath}`)
    return 'Imagen eliminada correctamente'
  } catch (error: unknown) {
    console.error('Error al eliminar la imagen:', error)
    throwError(ERROR_CODE.OPERATION_FAILED, `Error al eliminar imagen: ${imageUrl}`)
  }
}

export {
  uploadImageToFirebase,
  deleteImageFromStorage
}
