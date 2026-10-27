import type { Model } from 'sequelize'
import type {
  PublicVGroupResponse ,
  IVideoGroup,
  Ivideo,
  PublicVideoResponse
} from './videos.types.js'
type Parseable<T> = T | Model

const isSequelizeModel = (value: unknown): value is Model => (
  typeof value === 'object' &&
  value !== null &&
  'get' in value &&
  typeof (value as { get: unknown }).get === 'function'
)
const toRaw = <T>(value: Parseable<T>): T => {
  if (isSequelizeModel(value)) {
    return value.get({ plain: true }) as T
  }
  return value as T
}
export class VideoParser{
  static publicVideo = (rawInput: Parseable<PublicVideoResponse>) => {
    const raw = toRaw<PublicVideoResponse>(rawInput)
    return {
      id: raw.id,
      videoGroupId: raw.videoGroupId,
      name: raw.name,
      youTubeId: raw.youTubeId
    }
  }
  static publicVGroup = (rawInput: Parseable<PublicVGroupResponse>) => {
    const raw = toRaw<PublicVGroupResponse>(rawInput)
    const videosRaw = raw.videos || []
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      productId: raw.productId,
      videos: videosRaw.map(v => VideoParser.publicVideo(v))
    }
  }
  static video = (rawInput: Parseable<Ivideo>):Ivideo => {
    const raw = toRaw<Ivideo>(rawInput)
    return {
      id: raw.id,
      videoGroupId: raw.videoGroupId,
      name: raw.name,
      youTubeId: raw.youTubeId,
      enabled: raw.enabled
        
    }
  }
  static VGroup = (rawInput: Parseable<IVideoGroup>) => {
    const raw = toRaw<IVideoGroup>(rawInput)
    const videosRaw = raw.videos || []
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      productId: raw.productId,
      enabled: raw.enabled,
      videos:  videosRaw.map(v => VideoParser.video(v))
    }
  }
}