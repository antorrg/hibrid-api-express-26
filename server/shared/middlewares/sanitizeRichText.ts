import sanitizeHtml from 'sanitize-html'
import type { Request, Response, NextFunction } from 'express'

export const defaultSanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'ul', 'ol', 'li', 'a', 'span'],
  allowedAttributes: {
    'a': ['href', 'target']
  },
  allowedSchemes: ['http', 'https', 'mailto']
}

export const sanitizeRichText = (
  fieldNames: string[] = ['text'],
  options: sanitizeHtml.IOptions = defaultSanitizeOptions
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      fieldNames.forEach((field) => {
        if (typeof req.body[field] === 'string') {
          req.body[field] = sanitizeHtml(req.body[field], options)
        }
      })
    }
    next()
  }
}

export const sanitizeArrayRichText = (
  fieldNames: string[] = ['text'],
  arrNames: string | string[] = ['variants', 'items'],
  options: sanitizeHtml.IOptions = defaultSanitizeOptions
) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      const arrays = Array.isArray(arrNames) ? arrNames : [arrNames]
      arrays.forEach((arrayKey) => {
        const targetArray = req.body[arrayKey]
        if (Array.isArray(targetArray)) {
          targetArray.forEach((item: Record<string, any>) => {
            if (item && typeof item === 'object') {
              fieldNames.forEach((field) => {
                if (typeof item[field] === 'string') {
                  item[field] = sanitizeHtml(item[field], options)
                }
              })
            }
          })
        }
      })
    }
    next()
  }
}
