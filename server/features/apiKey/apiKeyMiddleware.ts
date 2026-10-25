import type { Request, Response, NextFunction } from 'express'
import { middError, ERROR_CODE } from '../../configs/errors.js'
import type { IApiKeyVerification } from './ApiKey.types.js'

export type ApiKeyValidatorFn = (key: string) => Promise<IApiKeyVerification>

export class ApiMiddlewares {
  constructor(private readonly validator: ApiKeyValidatorFn) {}

  verifyApiKey = async(req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const apiKey = (req.headers['x-api-key'] || req.headers['authorization']) as string | undefined
    if (!apiKey || typeof apiKey !== 'string') {
      return next(middError(ERROR_CODE.UNAUTHORIZED, 'verifyApiKey', { message: 'Missing apiKey' }))
    }

    try {
      const verified = await this.validator(apiKey)
      if (!verified) {
        return next(middError(ERROR_CODE.UNAUTHORIZED, 'verifyApiKey', { message: 'Access denied' }))
      }
      (req as Request & { apiKeyData?: IApiKeyVerification }).apiKeyData = verified
      next()
    } catch (err) {
      next(err)
    }
  }
}
