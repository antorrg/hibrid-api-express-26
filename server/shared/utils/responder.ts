import { type Response } from 'express'

export function responder<T>(
  res: Response,
  status: number,
  data: T
) {
  return res.status(status).json(data)
}