import { UuidHandler } from '../../../shared/utils/UuidHandler.js'

export class UserApplications{
  static Id(prop:string){
    if(!prop || typeof(prop) !== 'string'|| !UuidHandler.uuidValidator(prop)){
      throw new Error('[UserDomain] Invalid id format')
    }
    return prop
  }

  static Email(prop:string){
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/  
    if(!prop || typeof(prop) !== 'string'|| !regexEmail.test(prop)){
      throw new Error('[UserDomain] Invalid email format')
    }
    return prop.toLowerCase()
  }
  static Role(prop:string){
    if(!prop || typeof(prop) !== 'string') throw new Error('[UserDomain] Invalid or missing role')
    const role = prop.trim().toUpperCase()
    const allowed = ['OWNER', 'ADMIN', 'USER']
    if(!allowed.includes(role)){
      throw new Error('[UserDomain] Invalid role')
    }
    return role
  }
  static validatePasswordHash(prop:string):string{
    if(typeof prop !== 'string' || prop.length < 20) throw new Error('[UserDomain] Invalid password hash')
    return prop
  }
  static validateName(prop:string):string{
    if(typeof prop !== 'string') throw new Error('[UserDomain] Invalid name')
    return prop
  }
  static validatePicture(prop:string):string{
    if(typeof prop !== 'string') throw new Error('[UserDomain] Invalid name')
    return prop
  }
  static validateNickname(prop:string):string{
    if(typeof prop !== 'string') throw new Error('[UserDomain] Invalid nickname')
    return prop
  }
  static validateEnabled(prop:boolean):boolean{
    if(typeof prop !== 'boolean') throw new Error('[UserDomain] Invalid enabled')
    return prop
  }

}