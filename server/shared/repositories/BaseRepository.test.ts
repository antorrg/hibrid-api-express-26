import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { startUp, closeDatabase, User as UserModel } from '../../configs/database.js'
import { ERROR_CODE } from '../../configs/errors.js'
import type { User as UserDb } from '../../models/user.model.js'
import { BaseRepository } from './BaseRepository.js'
import * as help from './testHelpers/testHelp.help.js'

describe('BaseRepository unit test', () => {
  beforeAll(async() => {
    await startUp(true, true)
  })
  afterAll(async() => {
    await closeDatabase()
  })

  const test = new BaseRepository<help.IUserTest, help.CreateUserInput, help.UpdateUserInput, UserDb>(
    UserModel,
    help.parser,
    help.parser,
    'User',
    'email'
  )

  describe('Create method', () => {
    it('should create an element', async() => {
      const response = await test.create(help.dataCreate)
      expect(response).toEqual({
        id: expect.any(String),
        email: 'user@email.com',
        password: '123456',
        nickname: 'userTest',
        name: 'user',
        picture: 'https://picsum.photos/200?random=16',
        enabled: true
      })
      help.setStringId(response.id)
    })
  })

  describe('Get methods', () => {
    describe('"getAll" method', () => {
      it('should retrieve an array of elements', async() => {
        await help.createSeedRandomElements(UserModel, help.usersSeed)
        const response = await test.getAll()
        expect(response.length).toBe(16)
      })
      it('Should retrieve an array of elements filtered by query', async() => {
        const response = await test.getAll(false, 'enabled')
        expect(response.length).toBe(3)
      })
    })

    describe('"getById" method', () => {
      it('Should retrieve an element by Id', async() => {
        const response = await test.getById(help.getStringId())
        expect(response).toEqual({
          id: expect.any(String),
          email: 'user@email.com',
          password: '123456',
          nickname: 'userTest',
          name: 'user',
          picture: 'https://picsum.photos/200?random=16',
          enabled: true
        })
      })
    })

    describe('"findByField" method', () => {
      it('Should retrieve an element by field', async() => {
        const response = await test.findByField('user15@email.com', 'email')
        expect(response).toEqual({
          id: expect.any(String),
          email: 'user15@email.com',
          password: '123456',
          nickname: 'userTest15',
          name: 'Fifteen',
          picture: 'https://picsum.photos/200?random=15',
          enabled: expect.any(Boolean)
        })
      })
    })

    describe('"getWithPages" method', () => {
      it('Should retrieve an array of paginated elements', async() => {
        const queryObject = { page: 1, limit: 10 } as const
        const response = await test.getWithPages(queryObject)
        expect(response.info).toEqual({ total: 16, page: 1, limit: 10, totalPages: 2 })
        expect(response.data.length).toBe(10)
      })
      it('Should retrieve filtered elements', async() => {
        const queryObject = { page: 1, limit: 10, query: { enabled: false } } as const
        const response = await test.getWithPages(queryObject)
        expect(response.info).toEqual({ total: 3, page: 1, limit: 10, totalPages: 1 })
        expect(response.data.length).toBe(3)
      })
    })

    describe('"getAllEnabled" method', () => {
      it('Should retrieve only enabled elements', async() => {
        const response = await test.getAllEnabled()
        expect(response).toHaveLength(13)
        expect(response.every(user => user.enabled)).toBe(true)
      })

      it('Should retrieve enabled elements filtered by field', async() => {
        const response = await test.getAllEnabled('user01@email.com', 'email')
        expect(response).toHaveLength(1)
        expect(response[0]?.email).toBe('user01@email.com')
      })
    })

    describe('"getWithPagesEnabled" method', () => {
      it('Should retrieve enabled elements with pagination', async() => {
        const response = await test.getWithPagesEnabled({ page: 1, limit: 10 })
        expect(response.info).toEqual({ total: 13, page: 1, limit: 10, totalPages: 2 })
        expect(response.data).toHaveLength(10)
        expect(response.data.every(user => user.enabled)).toBe(true)
      })

      it('Should retrieve enabled elements filtered by query', async() => {
        const response = await test.getWithPagesEnabled({
          page: 1,
          limit: 10,
          query: { email: 'user01@email.com' }
        })
        expect(response.info).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 })
        expect(response.data).toHaveLength(1)
        expect(response.data[0]?.email).toBe('user01@email.com')
      })
    })

    describe('"getByIdEnabled" method', () => {
      it('Should retrieve an enabled element by Id', async() => {
        const response = await test.getByIdEnabled(help.getStringId())
        expect(response).toEqual({
          id: expect.any(String),
          email: 'user@email.com',
          password: '123456',
          nickname: 'userTest',
          name: 'user',
          picture: 'https://picsum.photos/200?random=16',
          enabled: true
        })
      })

      it('Should not retrieve a disabled element by Id', async() => {
        const disabledUser = help.usersSeed.find(user => !user.enabled)
        await expect(test.getByIdEnabled(disabledUser!.id))
          .rejects.toMatchObject({ code: ERROR_CODE.NOT_FOUND })
      })
    })
  })

  describe('Update method', () => {
    it('should update an element', async() => {
      const data = { name: 'Name of user' }
      const response = await test.update(help.getStringId(), data)
      expect(response).toEqual({
        id: expect.any(String),
        ...help.dataUpdate
      })
    })
  })

  describe('Delete method', () => {
    it('should delete an element', async() => {
      const response = await test.delete(help.getStringId())
      expect(response).toBe('user@email.com deleted successfully')
    })
  })
})