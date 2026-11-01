import type { FrontPage } from '../../models/frontPage.model.js'
export interface IFrontPage {
  id: string
  title: string
  info_header: string
  description: string
  picture: string
  enabled: boolean
}

export type IFrontCreate = Omit<IFrontPage, 'id' | 'enabled'>
export type IFrontUpdate = Partial<IFrontPage> & { saver?: boolean | string }
export type IFrotnUpdate = IFrontUpdate

export interface IFrontService {
  create(data: IFrontCreate): Promise<void>
  get(): Promise<IFrontPage>
  update(id: string, data: IFrotnUpdate): Promise<IFrontPage>
}

export const frontPageParser = (raw: any ): IFrontPage => ({
  id: raw.id,
  title: raw.title,
  info_header: raw.info_header,
  description: raw.description,
  picture: raw.picture,
  enabled: raw.enabled
})