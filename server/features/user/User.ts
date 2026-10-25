import envConfig from '../../configs/envConfig.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import { UserApplications } from './applications/UserApplications.js'

export interface UserProps {
  id: string;
  email: string;
  password: string;
  role: string;
  name: string;
  nickname: string;
  picture:string;
  enabled: boolean;
}
export type UserCreate = {email:string, hashedPassword:string}
export type UserUpdate = Omit<UserProps, 'id'|'password'| 'role'| 'enabled'>

export class User {
  protected readonly id: string
  protected email: string
  protected password: string
  protected role: string
  protected name: string
  protected nickname: string
  protected picture: string
  protected enabled: boolean
  

  constructor({ id, email, password, role, name, nickname, picture, enabled }: UserProps) {
    this.id = UserApplications.Id(id)
    this.email = UserApplications.Email(email)
    this.password = UserApplications.validatePasswordHash(password)
    this.role = UserApplications.Role(role)
    this.name = UserApplications.validateName(name)
    this.nickname = UserApplications.validateNickname(nickname)
    this.picture = UserApplications.validatePicture(picture)
    this.enabled = UserApplications.validateEnabled(enabled)
  }

  static register({ email, hashedPassword }:UserCreate){
    if(!email || !hashedPassword) throw new Error('Missing parameters')
    return new User({
      id: UuidHandler.createUuid(),
      email: UserApplications.Email(email),
      password: UserApplications.validatePasswordHash(hashedPassword),
      name: 'Falta completar',
      nickname: UserApplications.validateNickname(email?.split('@')[0] ?? 'Usuario'),
      picture: envConfig.UserImg,
      role: 'USER',
      enabled: true
    })
  }

  changePassword(hashedPassword: string) {
    this.password = UserApplications.validatePasswordHash(hashedPassword)
  }

  changeUserScope(role:string, enabled:boolean) {
    this.role = UserApplications.Role(role)
    this.enabled = UserApplications.validateEnabled(enabled)
  }

  updateProfile(user: UserUpdate){ 
    this.email = UserApplications.Email(user.email)
    this.name = UserApplications.validateName(user.name)
    this.nickname = UserApplications.validateNickname(user.nickname)
    this.picture = UserApplications.validatePicture(user.picture)
  }


  // Mapeos para Infraestructura (DB) y Cliente (DTO)
  toPersistence() {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      role: this.role, 
      name: this.name,
      nickname: this.nickname,
      picture: this.picture,
      enabled: this.enabled
    }
  }

  toDTO() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      name: this.name,
      nickname: this.nickname,
      picture: this.picture,
      enabled: this.enabled
    }
  }

}