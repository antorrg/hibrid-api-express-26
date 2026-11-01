export interface IFrontPage {
  id: string;
  title: string;
  info_header: string;
  description: string;
  picture: string;
  enabled: boolean;
}

export interface CreateFrontPageDTO {
  title: string;
  info_header: string;
  description: string;
  picture: string;
}

export interface UpdateFrontPageDTO {
  title?: string;
  info_header?: string;
  description?: string;
  picture?: string;
  enabled?: boolean;
  saver?: boolean;
}
