import envConfig from '../../../configs/envConfig.js'
import { ERROR_CODE, throwError } from '../../../configs/errors.js'
import { type UploadedImageFile } from '../../interfaces/base.interface.js'
import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export const firebaseConfig = {
  apiKey: envConfig.FireApiK,
  authDomain: envConfig.FireDomain,
  projectId: envConfig.FirePId,
  storageBucket: envConfig.FireStoreBuck,
  messagingSenderId: envConfig.FireMess,
  appId: envConfig.FireAppId,
  measurementId: envConfig.FireMeasure
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

// Funciones de subida y borrado de imagenes:

const uploadImageToFirebase = async(file: UploadedImageFile) => {
  try {
    // Prefijo compacto único (timestamp base36, ~8 chars) para evitar colisiones sin inflar la URL
    const compactPrefix = Date.now().toString(36)
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${compactPrefix}-${sanitizedFilename}`

    // Crear una referencia de almacenamiento con el nombre del archivo
    const storageRef = ref(storage, `imagesApi/${fileName}`)

    // Subir el archivo a Firebase Storage
    await uploadBytes(storageRef, file.buffer)

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef)

    return downloadURL
  } catch (error) {
    console.error('Error al subir la imagen a Firebase:', error)
    throwError(ERROR_CODE.OPERATION_FAILED, 'Error al subir imagen')
  }
}

const deleteImageFromStorage = async(imageUrl: string) => {
  try {
    // Extrae la ruta relativa del archivo desde la URL completa
    const bucketBaseUrl = 'https://firebasestorage.googleapis.com/v0/b/'
    const storageBucket = storage.app.options.storageBucket
    
    if (!imageUrl.startsWith(`${bucketBaseUrl}${storageBucket}`)) {
      throw new Error('La URL no pertenece al bucket de Firebase configurado.')
    }
    
    const filePath = decodeURIComponent(
      imageUrl
        .replace(`${bucketBaseUrl}${storageBucket}/o/`, '')
        .split('?')[0]
    )

    // Crea una referencia al archivo en Firebase Storage
    const fileRef = ref(storage, filePath)

    // Elimina el archivo
    await deleteObject(fileRef)
    console.log(`Imagen eliminada correctamente: ${filePath}`)
    return 'Imagen eliminada correctamente'
  } catch (error: any) {
    // Idempotencia: si el archivo ya no existe en el storage, se considera eliminado con éxito
    if (error?.code === 'storage/object-not-found') {
      return 'Imagen ya eliminada o no existente'
    }
    console.error('Error al eliminar la imagen:', error)
    throwError(ERROR_CODE.OPERATION_FAILED, `Error al eliminar imagen: ${imageUrl}`)
  }
}

export { 
  uploadImageToFirebase,
  deleteImageFromStorage 
}
