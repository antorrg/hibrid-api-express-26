export interface IVideo {
  id: string;
  videoGroupId: string;
  name: string;
  youTubeId: string;
  enabled: boolean;
}

export interface IVideoGroup {
  id: string;
  title: string;
  description: string;
  productId: string;
  enabled: boolean;
  videos: IVideo[];
}

export interface SingleVideoGroup {
  id: string;
  title: string;
  description: string;
  productId: string;
  enabled: boolean;
}

export interface VGroupInfo {
  page: number;
  limit: number;
  totalPages: number;
}

export interface SingleVideoGroupResponse {
  info: VGroupInfo;
  data: SingleVideoGroup[];
}

export interface VGQuery {
  page?: number;
  limit?: number;
}

export interface CreateVideoDTO {
  videoGroupId?: string;
  name: string;
  youTubeId: string;
}

export interface CreateVideoGroupDTO {
  title: string;
  description: string;
  productId: string;
  videos: CreateVideoDTO[];
}

export interface UpdateVideoGroupDTO {
  title?: string;
  description?: string;
  enabled?: boolean;
}

export interface UpdateVideoDTO {
  name?: string;
  youTubeId?: string;
  videoGroupId?: string;
}
