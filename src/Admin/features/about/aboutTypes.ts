export interface IAbout {
  id: string;
  title: string;
  text: string;
  picture: string;
  imgShow: boolean;
  enabled: boolean;
}

export interface CreateAboutDTO {
  title: string;
  text: string;
  picture: string;
  imgShow?: boolean;
}

export interface UpdateAboutDTO {
  title?: string;
  text?: string;
  picture?: string;
  imgShow?: boolean;
  enabled?: boolean;
  saver?: boolean;
}
