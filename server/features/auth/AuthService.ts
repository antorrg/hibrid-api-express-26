import { userService } from '../../shared/dependencies.js'


export class AuthService {
  async login(email: string, password: string) {
    return await userService.login(email, password)
    
  }
}