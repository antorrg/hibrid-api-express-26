import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VideosService } from './VideosService.js'
import type {
  VideoRepository,
  IVideoGroup,
  Ivideo,
  PublicVGroupResponse,
  PublicVideoResponse
} from './videos.types.js'

describe('VideosService', () => {
  let mockRepo: VideoRepository
  let service: VideosService

  const sampleVideo: Ivideo = {
    id: 'vid-1',
    videoGroupId: 'group-1',
    name: 'Sample Video 1',
    youTubeId: 'yt123',
    enabled: true
  }

  const sampleVideoGroup: IVideoGroup = {
    id: 'group-1',
    title: 'Group Title',
    description: 'Group Desc',
    productId: 'prod-1',
    enabled: true,
    videos: [sampleVideo]
  }

  const samplePublicVideo: PublicVideoResponse = {
    id: 'vid-1',
    videoGroupId: 'group-1',
    name: 'Sample Video 1',
    youTubeId: 'yt123'
  }

  const samplePublicVGroup: PublicVGroupResponse = {
    id: 'group-1',
    title: 'Group Title',
    description: 'Group Desc',
    productId: 'prod-1',
    videos: [samplePublicVideo]
  }

  beforeEach(() => {
    mockRepo = {
      publicGetVideos: vi.fn().mockResolvedValue([samplePublicVGroup]),
      publicGetVideoGroup: vi.fn().mockResolvedValue(samplePublicVGroup),
      publicGetVideo: vi.fn().mockResolvedValue(samplePublicVideo),
      getVideos: vi.fn().mockResolvedValue([sampleVideoGroup]),
      getVideoGroup: vi.fn().mockResolvedValue(sampleVideoGroup),
      getVideo: vi.fn().mockResolvedValue(sampleVideo),
      videoGroupCreate: vi.fn().mockImplementation(async(data) => ({
        ...data,
        enabled: true,
        videos: data.videos ?? []
      })),
      videoGroupUpdate: vi.fn().mockImplementation(async(id, data) => ({
        ...sampleVideoGroup,
        ...data,
        id
      })),
      videoGroupDelete: vi.fn().mockResolvedValue('VideoGroup group-1 eliminado exitosamente'),
      videoCreate: vi.fn().mockImplementation(async(data) => ({
        ...data,
        enabled: true
      })),
      videoUpdate: vi.fn().mockImplementation(async(id, data) => ({
        ...sampleVideo,
        ...data,
        id
      })),
      videoDelete: vi.fn().mockResolvedValue('Video vid-1 eliminado exitosamente')
    }

    service = new VideosService(mockRepo)
  })

  describe('Read operations', () => {
    it('should return public video groups', async() => {
      const result = await service.publicGetVideos()
      expect(mockRepo.publicGetVideos).toHaveBeenCalledTimes(1)
      expect(result).toEqual([samplePublicVGroup])
    })

    it('should return public video group by productId', async() => {
      const result = await service.publicGetVideoGroup('prod-1')
      expect(mockRepo.publicGetVideoGroup).toHaveBeenCalledWith('prod-1')
      expect(result).toEqual(samplePublicVGroup)
    })

    it('should return public single video by id', async() => {
      const result = await service.publicGetVideo('vid-1')
      expect(mockRepo.publicGetVideo).toHaveBeenCalledWith('vid-1')
      expect(result).toEqual(samplePublicVideo)
    })

    it('should return internal video groups', async() => {
      const result = await service.getVideos()
      expect(mockRepo.getVideos).toHaveBeenCalledTimes(1)
      expect(result).toEqual([sampleVideoGroup])
    })

    it('should return internal video group by id', async() => {
      const result = await service.getVideoGroup('group-1')
      expect(mockRepo.getVideoGroup).toHaveBeenCalledWith('group-1')
      expect(result).toEqual(sampleVideoGroup)
    })

    it('should return internal video by id', async() => {
      const result = await service.getVideo('vid-1')
      expect(mockRepo.getVideo).toHaveBeenCalledWith('vid-1')
      expect(result).toEqual(sampleVideo)
    })
  })

  describe('VideoGroup Create, Update, Delete', () => {
    it('should generate UUIDs for group and its videos and call repo.videoGroupCreate', async() => {
      const result = await service.videoGroupCreate({
        title: 'New Group',
        description: 'New Description',
        productId: 'prod-abc',
        videos: [
          { name: 'Video A', youTubeId: 'yt-a' },
          { name: 'Video B', youTubeId: 'yt-b' }
        ]
      })

      expect(mockRepo.videoGroupCreate).toHaveBeenCalledTimes(1)
      const passedPayload = (mockRepo.videoGroupCreate as any).mock.calls[0][0]
      expect(passedPayload.id).toBeDefined()
      expect(passedPayload.title).toBe('New Group')
      expect(passedPayload.enabled).toBe(true)
      expect(passedPayload.videos).toHaveLength(2)
      expect(passedPayload.videos[0].videoGroupId).toBe(passedPayload.id)
      expect(passedPayload.videos[0].id).toBeDefined()
      expect(result.title).toBe('New Group')
    })

    it('should update video group via repo', async() => {
      const result = await service.videoGroupUpdate('group-1', {
        title: 'Updated Title'
      })

      expect(mockRepo.videoGroupUpdate).toHaveBeenCalledWith('group-1', {
        title: 'Updated Title'
      })
      expect(result.title).toBe('Updated Title')
    })

    it('should delete video group and return confirmation message', async() => {
      const result = await service.videoGroupDelete('group-1')
      expect(mockRepo.videoGroupDelete).toHaveBeenCalledWith('group-1')
      expect(result).toBe('VideoGroup group-1 eliminado exitosamente')
    })
  })

  describe('Individual Video Create, Update, Delete', () => {
    it('should create single video with generated UUID and enabled=true', async() => {
      const result = await service.videoCreate({
        videoGroupId: 'group-1',
        name: 'Single Video',
        youTubeId: 'yt-single'
      })

      expect(mockRepo.videoCreate).toHaveBeenCalledTimes(1)
      const passedPayload = (mockRepo.videoCreate as any).mock.calls[0][0]
      expect(passedPayload.id).toBeDefined()
      expect(passedPayload.videoGroupId).toBe('group-1')
      expect(passedPayload.name).toBe('Single Video')
      expect(passedPayload.enabled).toBe(true)
      expect(result.name).toBe('Single Video')
    })

    it('should throw error if videoGroupId is missing on videoCreate', async() => {
      await expect(service.videoCreate({
        videoGroupId: '' as any,
        name: 'No Group',
        youTubeId: 'yt'
      })).rejects.toThrow('videoGroupId es requerido')
    })

    it('should update single video via repo', async() => {
      const result = await service.videoUpdate('vid-1', {
        name: 'Updated Video Name'
      })

      expect(mockRepo.videoUpdate).toHaveBeenCalledWith('vid-1', {
        name: 'Updated Video Name'
      })
      expect(result.name).toBe('Updated Video Name')
    })

    it('should delete single video via repo', async() => {
      const result = await service.videoDelete('vid-1')
      expect(mockRepo.videoDelete).toHaveBeenCalledWith('vid-1')
      expect(result).toBe('Video vid-1 eliminado exitosamente')
    })
  })
})
