import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from './UserService.js'
import type { UserProps } from './User.js'
import { User } from './User.js'
import type { IUserRepository } from './User.interfaces.js'
import { ERROR_CODE } from '../../configs/errors.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../shared/utils/Hasher.js', () => ({
  Hasher: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}))

import { Hasher } from '../../shared/utils/Hasher.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_HASH = '$2b$12$unHashValidoDePrueba1234567890' // >= 20 chars
const TEST_ID = UuidHandler.createUuid()

function makeUser(overrides: Partial<UserProps> = {}): User {
  return new User({
    id: TEST_ID,
    email: 'user@test.com',
    password: VALID_HASH,
    role: 'USER',
    name: 'Test User',
    nickname: 'testuser',
    picture: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    enabled: true,
    ...overrides
  })
}

// ─── Setup ────────────────────────────────────────────────────────────────────

const mockRepo = {
  save: vi.fn(),
  update: vi.fn(),
  getById: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  findByEmail: vi.fn(),
  getPublicById: vi.fn()
}

const mockHandleImageDelete = vi.fn()

function makeService() {
  return new UserService(
    mockRepo as unknown as IUserRepository,
    mockHandleImageDelete
  )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService
  let user: User

  beforeEach(() => {
    vi.clearAllMocks()
    user = makeUser()
    service = makeService()
  })

  // ── registerUser ─────────────────────────────────────────────────────────────

  describe('registerUser', () => {
    it('should hash the password, save the user, and return public DTO', async() => {
      vi.mocked(Hasher.hash).mockResolvedValue(VALID_HASH)
      mockRepo.save.mockResolvedValue(undefined)

      const result = await service.registerUser({ email: 'new@test.com', password: 'rawPassword123' })

      expect(Hasher.hash).toHaveBeenCalledWith('rawPassword123')
      expect(mockRepo.save).toHaveBeenCalledOnce()
      expect(result).toMatchObject({
        email: 'new@test.com',
        role: 'USER',
        enabled: true,
        name: 'Falta completar',
        nickname: 'new'
      })
      expect(result).not.toHaveProperty('password')
    })

    it('should throw an error if repository fails to save user', async() => {
      vi.mocked(Hasher.hash).mockResolvedValue(VALID_HASH)
      mockRepo.save.mockRejectedValue(new Error('DB Save Failed'))

      await expect(service.registerUser({ email: 'new@test.com', password: 'rawPassword123' }))
        .rejects.toThrow('DB Save Failed')
    })
  })

  // ── updateProfile ────────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update user profile correctly', async() => {
      mockRepo.getById.mockResolvedValue(user)
      const updatedUserDto = {
        ...user.toDTO(),
        name: 'New Name',
        nickname: 'newnick'
      }
      mockRepo.update.mockResolvedValue(updatedUserDto)

      const updateData = {
        email: 'user@test.com',
        name: 'New Name',
        nickname: 'newnick',
        picture: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      }

      const result = await service.updateProfile(user.toDTO().id, updateData)

      expect(mockRepo.getById).toHaveBeenCalledWith(user.toDTO().id)
      expect(mockRepo.update).toHaveBeenCalledOnce()
      expect(mockHandleImageDelete).not.toHaveBeenCalled()
      expect(result.name).toBe('New Name')
    })

    it('should execute handleImageDelete if profile picture URL changes', async() => {
      mockRepo.getById.mockResolvedValue(user)
      mockRepo.update.mockResolvedValue({
        ...user.toDTO(),
        picture: 'https://res.cloudinary.com/demo/image/upload/new_sample.jpg'
      })

      const updateData = {
        email: 'user@test.com',
        name: 'Test User',
        nickname: 'testuser',
        picture: 'https://res.cloudinary.com/demo/image/upload/new_sample.jpg'
      }

      await service.updateProfile(user.toDTO().id, updateData)

      expect(mockHandleImageDelete).toHaveBeenCalledWith('https://res.cloudinary.com/demo/image/upload/sample.jpg')
    })

    it('should throw NOT_FOUND if user does not exist', async() => {
      mockRepo.getById.mockResolvedValue(null)

      await expect(service.updateProfile('bad_id', {
        email: 'user@test.com',
        name: 'Test',
        nickname: 'test',
        picture: 'pic.jpg'
      })).rejects.toMatchObject({ code: ERROR_CODE.NOT_FOUND })
    })

    it('should throw ACCESS_DENIED if target user has OWNER role (#protectProtocol)', async() => {
      const ownerUser = makeUser({ role: 'OWNER' })
      mockRepo.getById.mockResolvedValue(ownerUser)

      await expect(service.updateProfile(ownerUser.toDTO().id, {
        email: 'owner@test.com',
        name: 'Owner',
        nickname: 'owner',
        picture: 'pic.jpg'
      })).rejects.toMatchObject({ code: ERROR_CODE.ACCESS_DENIED })
    })
  })

  // ── changePassword ───────────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should change password when current password is valid', async() => {
      vi.mocked(Hasher.compare).mockResolvedValue(true)
      vi.mocked(Hasher.hash).mockResolvedValue('$2b$12$NEWHASHFORTESTING123456789')
      mockRepo.getById.mockResolvedValue(user)
      mockRepo.update.mockResolvedValue(user.toDTO())

      const result = await service.changePassword({
        id: user.toDTO().id,
        password: 'currentPassword123',
        newPassword: 'newPassword456'
      })

      expect(Hasher.compare).toHaveBeenCalledWith('currentPassword123', VALID_HASH)
      expect(Hasher.hash).toHaveBeenCalledWith('newPassword456')
      expect(mockRepo.update).toHaveBeenCalledOnce()
      expect(result).not.toHaveProperty('password')
    })

    it('should throw NOT_FOUND if user does not exist', async() => {
      mockRepo.getById.mockResolvedValue(null)

      await expect(service.changePassword({
        id: 'bad_id',
        password: 'old',
        newPassword: 'new'
      })).rejects.toMatchObject({ code: ERROR_CODE.NOT_FOUND })
    })

    it('should throw INVALID_INPUT if current password is incorrect', async() => {
      vi.mocked(Hasher.compare).mockResolvedValue(false)
      mockRepo.getById.mockResolvedValue(user)

      await expect(service.changePassword({
        id: user.toDTO().id,
        password: 'wrongPassword',
        newPassword: 'newPassword'
      })).rejects.toMatchObject({ code: ERROR_CODE.INVALID_INPUT })
    })

    it('should throw ACCESS_DENIED if target user is OWNER (#protectProtocol)', async() => {
      const ownerUser = makeUser({ role: 'OWNER' })
      mockRepo.getById.mockResolvedValue(ownerUser)

      await expect(service.changePassword({
        id: ownerUser.toDTO().id,
        password: 'old',
        newPassword: 'new'
      })).rejects.toMatchObject({ code: ERROR_CODE.ACCESS_DENIED })
    })
  })

  // ── upgradeUser ──────────────────────────────────────────────────────────────

  describe('upgradeUser', () => {
    it('should update user role and enabled status', async() => {
      mockRepo.getById.mockResolvedValue(user)
      const updatedDto = { ...user.toDTO(), role: 'ADMIN', enabled: false }
      mockRepo.update.mockResolvedValue(updatedDto)

      const result = await service.upgradeUser(user.toDTO().id, { role: 'ADMIN', enabled: false })

      expect(mockRepo.update).toHaveBeenCalledOnce()
      expect(result.role).toBe('ADMIN')
      expect(result.enabled).toBe(false)
    })

    it('should throw ROLE_NOT_ALLOWED if new role is invalid', async() => {
      await expect(service.upgradeUser(user.toDTO().id, { role: 'SUPERUSER', enabled: true }))
        .rejects.toMatchObject({ code: ERROR_CODE.ROLE_NOT_ALLOWED })
    })

    it('should throw NOT_FOUND if user does not exist', async() => {
      mockRepo.getById.mockResolvedValue(null)

      await expect(service.upgradeUser('bad_id', { role: 'ADMIN', enabled: true }))
        .rejects.toMatchObject({ code: ERROR_CODE.NOT_FOUND })
    })

    it('should throw ACCESS_DENIED if target user has OWNER role (#protectProtocol)', async() => {
      const ownerUser = makeUser({ role: 'OWNER' })
      mockRepo.getById.mockResolvedValue(ownerUser)

      await expect(service.upgradeUser(ownerUser.toDTO().id, { role: 'ADMIN', enabled: true }))
        .rejects.toMatchObject({ code: ERROR_CODE.ACCESS_DENIED })
    })
  })

  // ── deleteUser ───────────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should delete user and handle associated image deletion', async() => {
      mockRepo.getById.mockResolvedValue(user)
      mockRepo.delete.mockResolvedValue(undefined)
      mockHandleImageDelete.mockResolvedValue(undefined)

      const result = await service.deleteUser(user.toDTO().id)

      expect(mockRepo.delete).toHaveBeenCalledWith(user.toDTO().id)
      expect(mockHandleImageDelete).toHaveBeenCalledWith('https://res.cloudinary.com/demo/image/upload/sample.jpg')
      expect(result).toBe('User with email: user@test.com deleted successfully')
    })

    it('should throw NOT_FOUND if user does not exist', async() => {
      mockRepo.getById.mockResolvedValue(null)

      await expect(service.deleteUser('bad_id'))
        .rejects.toMatchObject({ code: ERROR_CODE.NOT_FOUND })
    })

    it('should throw ACCESS_DENIED when attempting to delete an OWNER user (#protectProtocol)', async() => {
      const ownerUser = makeUser({ role: 'OWNER' })
      mockRepo.getById.mockResolvedValue(ownerUser)

      await expect(service.deleteUser(ownerUser.toDTO().id))
        .rejects.toMatchObject({ code: ERROR_CODE.ACCESS_DENIED })
    })
  })

  // ── login ─────────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return user DTO when credentials are valid and user is enabled', async() => {
      vi.mocked(Hasher.compare).mockResolvedValue(true)
      mockRepo.findByEmail.mockResolvedValue(user)

      const result = await service.login('user@test.com', 'correctPassword')

      expect(Hasher.compare).toHaveBeenCalledWith('correctPassword', VALID_HASH)
      expect(result).toEqual(user.toDTO())
      expect(result).not.toHaveProperty('password')
    })

    it('should throw INVALID_CREDENTIALS if email does not exist', async() => {
      mockRepo.findByEmail.mockResolvedValue(null)

      await expect(service.login('notfound@test.com', 'password'))
        .rejects.toMatchObject({ code: ERROR_CODE.INVALID_CREDENTIALS })
    })

    it('should throw ACCESS_BLOCKED if user is disabled', async() => {
      const disabledUser = makeUser({ enabled: false })
      mockRepo.findByEmail.mockResolvedValue(disabledUser)

      await expect(service.login('user@test.com', 'password'))
        .rejects.toMatchObject({ code: ERROR_CODE.ACCESS_BLOCKED })
    })
    it('should throw INVALID_INPUT if password is incorrect', async() => {
      vi.mocked(Hasher.compare).mockResolvedValue(false)
      mockRepo.findByEmail.mockResolvedValue(user)

      await expect(service.login('user@test.com', 'wrongPassword'))
        .rejects.toMatchObject({ code: ERROR_CODE.INVALID_CREDENTIALS })
    })
  })

  // ── getAllUsers ───────────────────────────────────────────────────────────────

  describe('getAllUsers', () => {
    it('should return list mapped to public user objects without password', async() => {
      mockRepo.getAll.mockResolvedValue([user.toPersistence()])

      const result = await service.getAllUsers()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: TEST_ID,
        email: 'user@test.com',
        role: 'USER',
        name: 'Test User',
        nickname: 'testuser',
        picture: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        enabled: true
      })
      expect(result[0]).not.toHaveProperty('password')
    })

    it('should return an empty array if no users exist', async() => {
      mockRepo.getAll.mockResolvedValue([])

      const result = await service.getAllUsers()

      expect(result).toEqual([])
    })
  })

  // ── getUserById ───────────────────────────────────────────────────────────────

  describe('getUserById', () => {
    it('should delegate to repository getPublicById and return the result', async() => {
      const dto = user.toDTO()
      mockRepo.getPublicById.mockResolvedValue(dto)

      const result = await service.getUserById(TEST_ID)

      expect(mockRepo.getPublicById).toHaveBeenCalledWith(TEST_ID)
      expect(result).toEqual(dto)
    })

    it('should return null if getPublicById does not find user', async() => {
      mockRepo.getPublicById.mockResolvedValue(null)

      const result = await service.getUserById('non_existent')

      expect(result).toBeNull()
    })
  })
})