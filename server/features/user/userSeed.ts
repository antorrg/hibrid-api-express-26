import { User as UserDb } from '../../configs/database.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { Hasher } from '../../shared/utils/Hasher.js'
import envConfig from '../../configs/envConfig.js'
import logger from '../../configs/logger.js'
import { ERROR_CODE, throwError } from '../../configs/errors.js'
import { UserRole } from '../../shared/auth/authMiddlewares.js'

export async function userSeed(){
  const existsMsg = 'There are users in db'
  const createMsg = 'User created successfully'
  const dataAdmin = {
    id: UuidHandler.createUuid(),
    email: envConfig.AdminUserEmail,
    password: await Hasher.hash(envConfig.AdminUserPass),
    nickname: envConfig.AdminUserEmail.split('@')[0],
    name: envConfig.AdminUserName,
    picture: envConfig.UserImg,
    role: UserRole.OWNER,
    enabled:true
  }
  const exists = await UserDb.count()
  if(exists !== 0){
    logger.info(existsMsg)
    return
  }
  const userCreated = await UserDb.create(dataAdmin)
  if(!userCreated){throwError(ERROR_CODE.OPERATION_FAILED, 'Fallo creacion de usuario')}
  logger.info(createMsg)
}
