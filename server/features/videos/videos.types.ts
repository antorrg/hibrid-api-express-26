export interface Ivideo {
    id: string
    videoGroupId: string
    name: string
    youTubeId: string
    enabled: boolean
}
export interface IVideoGroup {
    id:string
    title: string
    description: string
    productId: string
    enabled: boolean
    videos: Ivideo[]
}
export interface VideoCreate {
    videoGroupId?: string
    name: string
    youTubeId: string
}
export interface VideoGroupCreate {
    title: string
    description: string
    productId: string
    videos: VideoCreate[]
}
export type VideoGroupUpdate = Omit<IVideoGroup, 'id' | 'productId' | 'videos'>
export type VideoUpdate = Omit<Ivideo, 'id' | 'videoGroupId'>
export type PublicVideoResponse = Omit<Ivideo, 'enabled'>
export interface PublicVGroupResponse {
    id: string
    title: string
    description: string
    productId: string
    videos?: PublicVideoResponse[]
}

export interface VideoCreationAttributes {
    id: string
    videoGroupId: string
    name: string
    youTubeId: string
    enabled?: boolean
}

export interface VideoGroupCreationAttributes {
    id: string
    title: string
    description: string
    productId: string
    enabled?: boolean
    videos?: VideoCreationAttributes[]
}

export interface VideoRepository {
  publicGetVideos(): Promise<PublicVGroupResponse[]>
  publicGetVideoGroup(productId: string): Promise<PublicVGroupResponse | string>
  publicGetVideo(id: string): Promise<PublicVideoResponse>
  getVideos(): Promise<IVideoGroup[]>
  getVideoGroup(id: string): Promise<IVideoGroup>
  getVideo(id: string): Promise<Ivideo>
  videoGroupCreate(data: VideoGroupCreationAttributes): Promise<IVideoGroup>
  videoGroupUpdate(id: string, data: VideoGroupUpdate): Promise<IVideoGroup>
  videoGroupDelete(id: string): Promise<string>
  videoCreate(data: VideoCreationAttributes): Promise<Ivideo>
  videoUpdate(id: string, data: VideoUpdate): Promise<Ivideo>
  videoDelete(id: string): Promise<string>
}

