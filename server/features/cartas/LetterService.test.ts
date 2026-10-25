import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LetterService } from './LetterService.js'
import type { ILetterRepository } from './Letter.types.js'

describe('LetterService', () => {
  let mockRepo: ILetterRepository
  let mockEmailSend: ReturnType<typeof vi.fn>
  let service: LetterService

  beforeEach(() => {
    mockRepo = {
      create: vi.fn().mockImplementation(async(data) => ({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      getPublicLetters: vi.fn(),
      getAllAdminLetters: vi.fn(),
      getById: vi.fn(),
      updateModerate: vi.fn().mockImplementation(async(id, aprobada) => ({
        id,
        tema: 'Gratitud',
        mensaje: 'Test',
        aprobada
      })),
      delete: vi.fn().mockResolvedValue('Carta let-1 eliminada exitosamente')
    }
    mockEmailSend = vi.fn().mockResolvedValue(undefined)
    service = new LetterService(mockRepo, mockEmailSend)
  })

  describe('createLetter', () => {
    it('should throw error for invalid tema', async() => {
      await expect(service.createLetter({ tema: 'InvalidTema', mensaje: 'Hola' }))
        .rejects.toThrow('Tema no valido')
    })

    it('should create letter and trigger email notification', async() => {
      const result = await service.createLetter({
        tema: 'Gratitud',
        mensaje: 'Muchas gracias por todo'
      })

      expect(mockRepo.create).toHaveBeenCalledTimes(1)
      expect(result.tema).toBe('Gratitud')
      expect(result.aprobada).toBe(false)
      expect(mockEmailSend).toHaveBeenCalledWith(
        'letters@appmail.com',
        'Nueva carta para revisar',
        expect.stringContaining('Gratitud')
      )
    })
  })

  describe('moderateLetter', () => {
    it('should update moderate approval status', async() => {
      const updated = await service.moderateLetter('let-1', { aprobada: true })

      expect(mockRepo.updateModerate).toHaveBeenCalledWith('let-1', true)
      expect(updated.aprobada).toBe(true)
    })
  })

  describe('deleteLetter', () => {
    it('should return confirmation message on delete', async() => {
      const result = await service.deleteLetter('let-1')
      expect(result).toBe('Carta let-1 eliminada exitosamente')
      expect(mockRepo.delete).toHaveBeenCalledWith('let-1')
    })
  })
})
