import bcrypt from 'bcrypt'

export class Hasher{
  static hash = async(value:string):Promise<string> => {
    return await bcrypt.hash(value, 12)
  }
  static compare = async(value:string, hash:string):Promise<boolean> => {
    return await bcrypt.compare(value, hash)
  }
}
