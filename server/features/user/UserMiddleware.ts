import type { Request, Response, NextFunction } from 'express'
import { ERROR_CODE, middError } from '../../configs/errors.js'
export class UserMiddleware{

  static protectedProfile = (req:Request, res: Response, next:NextFunction) => {
    const user = req.session.user
    if (!user) {
      return next(middError(ERROR_CODE.UNAUTHORIZED, 'No autenticado'))
    }
    const userId = user.id
    const  id  = req.params.userId
    if(id !== userId){ return next(middError(ERROR_CODE.FORBIDDEN, 'Solo el propietario puede actualizar su perfil'))}
    next()
  }
  
  static protectUpgrade = (req:Request, res: Response, next:NextFunction) => {
    const user = req.session.user
    if (!user) {
      return next(middError(ERROR_CODE.UNAUTHORIZED, 'No autenticado'))
    }
    const userId = user.id
    const { id } = req.body
    if(id !== userId){ return next(middError(ERROR_CODE.FORBIDDEN, 'Solo el propietario puede actualizar su perfil'))}
    next()
  }
}