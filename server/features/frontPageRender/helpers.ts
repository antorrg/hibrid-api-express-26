import type { Request } from 'express'
import envConfig from '../../configs/envConfig.js'


let metaStored = ''

export const setStored = (data: string):void => {metaStored = data}

export const getStored = ():string => {return metaStored}

export const getAuth = ( req: Request ): boolean => req.session? true : false

export const url = envConfig.Redirection

export const uriWhatsApp=`https://wa.me/${envConfig.WhatsAppNumber}?text=${encodeURIComponent(envConfig.WhatsAppMessage)}`