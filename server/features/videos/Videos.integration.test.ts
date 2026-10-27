import { describe, it, expect } from 'vitest'
import { videoService, videoRepository } from '../../shared/dependencies.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import type { VideoGroupCreate } from './videos.types.js'

describe('Videos Integration Tests (Service & Repository)', () => {
  describe('VideoGroup Atomic Creation', () => {
    it('should create a VideoGroup with videos in a single transaction', async() => {
      const productId = UuidHandler.createUuid()
      const payload: VideoGroupCreate = {
        title: 'Recorrido de Producto 1',
        description: 'Explicación completa en video del producto',
        productId,
        videos: [
          { name: 'Video Parte 1', youTubeId: 'yt-part-1' },
          { name: 'Video Parte 2', youTubeId: 'yt-part-2' }
        ]
      }

      const created = await videoService.videoGroupCreate(payload)

      expect(created.id).toBeDefined()
      expect(created.title).toBe('Recorrido de Producto 1')
      expect(created.description).toBe('Explicación completa en video del producto')
      expect(created.productId).toBe(productId)
      expect(created.enabled).toBe(true)

      expect(created.videos).toBeDefined()
      expect(created.videos).toHaveLength(2)
      expect(created.videos[0].id).toBeDefined()
      expect(created.videos[0].videoGroupId).toBe(created.id)
      expect(created.videos[0].name).toBe('Video Parte 1')
      expect(created.videos[0].youTubeId).toBe('yt-part-1')
      expect(created.videos[0].enabled).toBe(true)

      expect(created.videos[1].id).toBeDefined()
      expect(created.videos[1].videoGroupId).toBe(created.id)
      expect(created.videos[1].name).toBe('Video Parte 2')
    })
  })

  describe('Read Operations (Internal)', () => {
    it('should return all video groups with their videos populated', async() => {
      const allGroups = await videoService.getVideos()

      expect(allGroups.length).toBeGreaterThan(0)
      const first = allGroups[0]
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('title')
      expect(first).toHaveProperty('productId')
      expect(first).toHaveProperty('videos')
      expect(Array.isArray(first.videos)).toBe(true)
    })

    it('should return a specific video group by id with its videos', async() => {
      const allGroups = await videoService.getVideos()
      const targetGroup = allGroups[0]

      const found = await videoService.getVideoGroup(targetGroup.id)

      expect(found.id).toBe(targetGroup.id)
      expect(found.title).toBe(targetGroup.title)
      expect(found.videos).toHaveLength(targetGroup.videos.length)
      expect(found.videos[0].videoGroupId).toBe(targetGroup.id)
    })

    it('should return an individual video by id', async() => {
      const allGroups = await videoService.getVideos()
      const targetVideo = allGroups[0].videos[0]

      const found = await videoService.getVideo(targetVideo.id)

      expect(found.id).toBe(targetVideo.id)
      expect(found.name).toBe(targetVideo.name)
      expect(found.videoGroupId).toBe(allGroups[0].id)
      expect(found.enabled).toBe(true)
    })
  })

  describe('Public Read Operations (via sequelize.query)', () => {
    it('should return public video groups without the enabled property', async() => {
      const publicGroups = await videoService.publicGetVideos()

      expect(publicGroups.length).toBeGreaterThan(0)
      const first = publicGroups[0]
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('title')
      expect(first).toHaveProperty('description')
      expect(first).toHaveProperty('productId')
      expect(first).toHaveProperty('videos')
      expect(first).not.toHaveProperty('enabled')

      if (first.videos && first.videos.length > 0) {
        expect(first.videos[0]).toHaveProperty('id')
        expect(first.videos[0]).toHaveProperty('name')
        expect(first.videos[0]).toHaveProperty('youTubeId')
        expect(first.videos[0]).not.toHaveProperty('enabled')
      }
    })

    it('should return public video group by productId with its videos', async() => {
      const allGroups = await videoService.getVideos()
      const target = allGroups[0]

      const publicGroup = await videoService.publicGetVideoGroup(target.productId)

      expect(publicGroup.id).toBe(target.id)
      expect(publicGroup.productId).toBe(target.productId)
      expect(publicGroup.title).toBe(target.title)
      expect(publicGroup).not.toHaveProperty('enabled')

      expect(publicGroup.videos).toBeDefined()
      expect(publicGroup.videos!.length).toBeGreaterThan(0)
      expect(publicGroup.videos![0].videoGroupId).toBe(target.id)
      expect(publicGroup.videos![0]).not.toHaveProperty('enabled')
    })

    it('should return a public video by id without enabled property', async() => {
      const allGroups = await videoService.getVideos()
      const targetVideo = allGroups[0].videos[0]

      const publicVideo = await videoService.publicGetVideo(targetVideo.id)

      expect(publicVideo.id).toBe(targetVideo.id)
      expect(publicVideo.name).toBe(targetVideo.name)
      expect(publicVideo.youTubeId).toBe(targetVideo.youTubeId)
      expect(publicVideo.videoGroupId).toBe(allGroups[0].id)
      expect(publicVideo).not.toHaveProperty('enabled')
    })
  })

  describe('Update Operations', () => {
    it('should update video group attributes', async() => {
      const allGroups = await videoService.getVideos()
      const targetGroup = allGroups[0]

      const updated = await videoService.videoGroupUpdate(targetGroup.id, {
        title: 'Titulo Actualizado de Grupo'
      })

      expect(updated.id).toBe(targetGroup.id)
      expect(updated.title).toBe('Titulo Actualizado de Grupo')

      const refreshed = await videoService.getVideoGroup(targetGroup.id)
      expect(refreshed.title).toBe('Titulo Actualizado de Grupo')
    })

    it('should update individual video attributes', async() => {
      const allGroups = await videoService.getVideos()
      const targetVideo = allGroups[0].videos[0]

      const updated = await videoService.videoUpdate(targetVideo.id, {
        name: 'Nombre de Video Actualizado'
      })

      expect(updated.id).toBe(targetVideo.id)
      expect(updated.name).toBe('Nombre de Video Actualizado')

      const refreshed = await videoService.getVideo(targetVideo.id)
      expect(refreshed.name).toBe('Nombre de Video Actualizado')
    })
  })

  describe('Cascade Deletion', () => {
    it('should delete video group and cascade delete all its associated videos', async() => {
      const productId = UuidHandler.createUuid()
      const created = await videoService.videoGroupCreate({
        title: 'Grupo para Borrar',
        description: 'Sera borrado junto con sus videos',
        productId,
        videos: [
          { name: 'Video a Borrar 1', youTubeId: 'yt-del-1' },
          { name: 'Video a Borrar 2', youTubeId: 'yt-del-2' }
        ]
      })

      const groupId = created.id
      const videoId1 = created.videos[0].id
      const videoId2 = created.videos[1].id

      const deleteMessage = await videoService.videoGroupDelete(groupId)
      expect(deleteMessage).toContain('eliminado exitosamente')

      // Verificar que el VideoGroup ya no existe
      await expect(videoService.getVideoGroup(groupId)).rejects.toThrow('no encontrado')

      // Verificar que los videos asociados fueron eliminados en cascada
      await expect(videoService.getVideo(videoId1)).rejects.toThrow('no encontrado')
      await expect(videoService.getVideo(videoId2)).rejects.toThrow('no encontrado')
    })
  })

  describe('Individual Video Management', () => {
    it('should create an individual video for an existing group', async() => {
      const allGroups = await videoService.getVideos()
      const targetGroup = allGroups[0]

      const newVideo = await videoService.videoCreate({
        videoGroupId: targetGroup.id,
        name: 'Video Agregado Individualmente',
        youTubeId: 'yt-individual'
      })

      expect(newVideo.id).toBeDefined()
      expect(newVideo.videoGroupId).toBe(targetGroup.id)
      expect(newVideo.name).toBe('Video Agregado Individualmente')
      expect(newVideo.enabled).toBe(true)

      const groupWithNewVideo = await videoService.getVideoGroup(targetGroup.id)
      expect(groupWithNewVideo.videos.some(v => v.id === newVideo.id)).toBe(true)
    })

    it('should delete an individual video without deleting the group', async() => {
      const allGroups = await videoService.getVideos()
      const targetGroup = allGroups[0]

      const tempVideo = await videoService.videoCreate({
        videoGroupId: targetGroup.id,
        name: 'Video Temporal Para Borrar',
        youTubeId: 'yt-temp'
      })

      const deleteMsg = await videoService.videoDelete(tempVideo.id)
      expect(deleteMsg).toContain('eliminado exitosamente')

      await expect(videoService.getVideo(tempVideo.id)).rejects.toThrow('no encontrado')

      // El grupo principal sigue existiendo intacto
      const groupStillExists = await videoService.getVideoGroup(targetGroup.id)
      expect(groupStillExists.id).toBe(targetGroup.id)
    })
  })
})
