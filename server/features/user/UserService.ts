import type { UserUpdate } from './User.js'
import { User } from './User.js'
import type { IUserRepository, IUser } from './User.interfaces.js'
import { Hasher } from '../../shared/utils/Hasher.js'
import { throwError, ERROR_CODE } from '../../configs/errors.js'

export class UserService {
  private userRepository: IUserRepository
  private handleImageDelete: (url:string) => Promise<string | undefined>

  constructor(
    userRepository: IUserRepository,
    handleImageDelete: (url:string) => Promise<string | undefined>
  ) {
    this.userRepository = userRepository
    this.handleImageDelete= handleImageDelete
  }
  private mapToPublic(record: IUser): IUser {
    return {
      id: record.id,
      email: record.email,
      role: record.role,
      name: record.name,
      nickname: record.nickname,
      picture: record.picture,
      enabled: record.enabled
    }
  }

  /**
     * Registra un nuevo usuario en el sistema.
     * Hashea la contraseña y delega la creación a la Entidad y al Repositorio.
     */
  async registerUser(data: { email: string; password: string } ): Promise<IUser> {
    // 1. Hashear la contraseña (preocupación de infraestructura/aplicación)
    const hashedPassword = await Hasher.hash(data.password)

    // 2. Crear la Entidad de Dominio (esto genera el UUID y valida reglas)
    const newUser = User.register({
      email: data.email,
      hashedPassword
    })

    // 3. Guardar en la base de datos (El repositorio valida si el email ya existe)
    await this.userRepository.save(newUser)

    // 4. Retornamos el DTO
    return newUser.toDTO()
  }

  /**
     * Actualiza el perfil básico del usuario.
     */
  async updateProfile(id: string, updateData: UserUpdate): Promise<IUser> {
    let oldPictureUrl:string | undefined = undefined
    let execFunction: boolean = false
    
        
    // 1. Buscar el usuario existente
    const user = await this.userRepository.getById(id)
    if (!user) {
      throwError(ERROR_CODE.NOT_FOUND, 'User not found')
    }
    const oldUser = user!.toDTO()
    UserService.#protectProtocol(oldUser.role)

    if(oldUser.picture !==  updateData.picture){
      oldPictureUrl = oldUser.picture
      execFunction = true
    }

        // 2. Modificar el estado a través de los métodos de dominio
        user!.updateProfile(updateData)

        // 3. Guardar los cambios (usamos update para estar seguros de que no es creación)
        const updatedUser = await this.userRepository.update(id, user!)
        
        if(execFunction && oldPictureUrl !== undefined){
          await this.handleImageDelete(oldPictureUrl)
        }
        return updatedUser
  }

  /**
     * Cambia la contraseña de un usuario existente.
     */
  async changePassword(data:{ id: string, password:string, newPassword: string}): Promise<IUser> {
    const user = await this.userRepository.getById(data.id)
    if (!user) {
      throwError(ERROR_CODE.NOT_FOUND, 'User not found')
    }
    const oldUser = user!.toPersistence()
    UserService.#protectProtocol(oldUser.role)
    const passwordMatch = await Hasher.compare( data.password, oldUser.password)
    if(!passwordMatch){ throwError(ERROR_CODE.INVALID_INPUT, 'Invalid password')}

    const newHashedPassword = await Hasher.hash(data.newPassword)
        
        user!.changePassword(newHashedPassword)

        const updatedUser = await this.userRepository.update(data.id, user!)
        return updatedUser
  }

  /**
     * Deshabilita un usuario.
     */
  async upgradeUser(userId: string, data:{role:string, enabled: boolean}): Promise<IUser> {

    const allowedNewRole =  ['OWNER', 'ADMIN','USER']
    if(!allowedNewRole.includes(data.role)){throwError(ERROR_CODE.ROLE_NOT_ALLOWED, 'Invalid role')}

    const user = await this.userRepository.getById(userId)
    if (!user) {
      throwError(ERROR_CODE.NOT_FOUND, 'User not found')
    }
    const oldUser = user!.toPersistence()
    UserService.#protectProtocol(oldUser!.role)

    user!.changeUserScope(data.role, data.enabled)

    const updatedUser = await this.userRepository.update(userId, user!)
    return updatedUser

  }

  /**
     * Elimina a un usuario
     */
  async deleteUser(userId:string){
    const user = await this.userRepository.getById(userId)
    if(!user) throwError(ERROR_CODE.NOT_FOUND, 'User not found')
    const userForDelete = user!.toDTO()
    UserService.#protectProtocol(userForDelete.role)
    const oldPictureUrl = userForDelete.picture
    const message = userForDelete.email
    await this.userRepository.delete(userId)
    await this.handleImageDelete(oldPictureUrl)
    return `User with email: ${message} deleted successfully`
  }
  /**
     * Compara el password y enabled y da acceso al usuario
     */
  async login(email: string, password: string): Promise<IUser> {
    const user = await this.userRepository.findByEmail(email)
    const dummyHash = '$2b$10$e8W/Z63kP6V10M.0m8WpCeQ2w.U5O20vJ/5N/xXJ3xXJ3xXJ3xXJ'

    if (!user) {
      await Hasher.compare(password, dummyHash)
      throwError(ERROR_CODE.INVALID_CREDENTIALS, 'Invalid credentials')
    }

    const passwordMatch = await Hasher.compare(password, user.toPersistence().password)
    if (!passwordMatch) {
      throwError(ERROR_CODE.INVALID_CREDENTIALS, 'Invalid credentials')
    }
    if (user.toDTO().enabled === false) {
      throwError(ERROR_CODE.ACCESS_BLOCKED, 'User blocked')
    }

    return user.toDTO()
  }
  /**
     * 
     * Entrega un array de usuarios
     */
  async getAllUsers(){
    const users = await this.userRepository.getAll()
    return users.map(user => this.mapToPublic(user))
  }
  async getUserById(userId:string){
    return await this.userRepository.getPublicById(userId)
  
  }
  static #protectProtocol(role: string):void {
    if(role === 'OWNER')throwError(ERROR_CODE.ACCESS_DENIED, 'Do not edited OWNER user')
  }
}
