
export interface IAbout {
  id: string
  title: string
  text: string
  picture: string
  imgShow: boolean
  enabled: boolean
}

export type IAboutCreate = Omit<IAbout, 'id' | 'enabled'>
export type IAboutUpdate = Partial<IAbout> & { saver?: boolean | string }


export interface IAboutService {
  create(data: IAboutCreate): Promise<void>
  get(): Promise<IAbout>
  update(id: string, data: IAboutUpdate): Promise<IAbout>
}

export const aboutParser = (raw: any ): IAbout => ({//eslint-disable-line
  id: raw.id,
  title: raw.title,
  picture: raw.picture,
  text: raw.text,
  imgShow: raw.imgShow,
  enabled: raw.enabled
})