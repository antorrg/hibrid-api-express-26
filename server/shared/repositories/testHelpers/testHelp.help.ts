import type { User as UserDb } from '../../../models/user.model.js'
import type { CreationAttributes } from 'sequelize'
import { UuidHandler } from '../../utils/UuidHandler.js'

export interface IUserTest {
  id: string
  email: string
  password: string
  nickname?: string | null
  name: string
  picture?: string | null
  enabled: boolean
}
export interface CreateUserInput {
  id: string
  email: string
  password: string
  nickname?: string | null
  name?: string | null
  picture?: string | null
  enabled: boolean
}
export type UpdateUserInput = Partial<CreateUserInput>

export type UserRecord = Pick<UserDb,
 'id' | 'email' | 'password' | 'nickname' | 'name' | 'picture' | 'enabled'
>
export const parser = (raw: UserRecord): IUserTest => {
  return {
    id: raw.id,
    email: raw.email,
    password: raw.password,
    nickname: raw.nickname,
    name: raw.name ?? '',
    picture: raw.picture,
    enabled: raw.enabled
  }
}
export const dataCreate = {
  id: UuidHandler.createUuid(),
  email: 'user@email.com',
  password: '123456',
  nickname: 'userTest',
  name: 'user',
  picture: 'https://picsum.photos/200?random=16',
  enabled: true
}
export const dataUpdate: UpdateUserInput = {
  email: 'user@email.com',
  password: '123456',
  nickname: 'userTest',
  name: 'Name of user',
  picture: 'https://picsum.photos/200?random=16',
  enabled: true
}
let stringId: string = ''
export const setStringId = (id: string): void => {
  stringId = id
}
export const getStringId = (): string => {
  return stringId
}
//* --------------------------------------------------
// ?          UserSeed
//* --------------------------------------------------
export const createSeedRandomElements = async(
  model: typeof UserDb,
  seed: readonly CreationAttributes<UserDb>[]
) => {
  try {
    if (!seed || seed.length === 0) throw new Error('No data')
    await model.bulkCreate(seed)
  } catch (error) {
    console.error('Error createSeedRandomElements: ', error)
  }
}

export const usersSeed = [
  {
    id: UuidHandler.createUuid(),
    email: 'user01@email.com',
    password: '123456',
    nickname: 'userTest01',
    name: 'One',
    picture: 'https://picsum.photos/200?random=1',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user02@email.com',
    password: '123456',
    nickname: 'userTest02',
    name: 'Two',
    picture: 'https://picsum.photos/200?random=2',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user03@email.com',
    password: '123456',
    nickname: 'userTest03',
    name: 'Three',
    picture: 'https://picsum.photos/200?random=3',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user04@email.com',
    password: '123456',
    nickname: 'userTest04',
    name: 'Four',
    picture: 'https://picsum.photos/200?random=4',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user05@email.com',
    password: '123456',
    nickname: 'userTest05',
    name: 'Five',
    picture: 'https://picsum.photos/200?random=5',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user06@email.com',
    password: '123456',
    nickname: 'userTest06',
    name: 'Six',
    picture: 'https://picsum.photos/200?random=6',
    enabled: false
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user07@email.com',
    password: '123456',
    nickname: 'userTest07',
    name: 'Seven',
    picture: 'https://picsum.photos/200?random=7',
    enabled: false
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user08@email.com',
    password: '123456',
    nickname: 'userTest08',
    name: 'Eight',
    picture: 'https://picsum.photos/200?random=8',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user09@email.com',
    password: '123456',
    nickname: 'userTest09',
    name: 'Nine',
    picture: 'https://picsum.photos/200?random=9',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user10@email.com',
    password: '123456',
    nickname: 'userTest10',
    name: 'Ten',
    picture: 'https://picsum.photos/200?random=10',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user11@email.com',
    password: '123456',
    nickname: 'userTest11',
    name: 'Eleven',
    picture: 'https://picsum.photos/200?random=11',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user12@email.com',
    password: '123456',
    nickname: 'userTest12',
    name: 'Twelve',
    picture: 'https://picsum.photos/200?random=12',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user13@email.com',
    password: '123456',
    nickname: 'userTest13',
    name: 'Thirteen',
    picture: 'https://picsum.photos/200?random=13',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user14@email.com',
    password: '123456',
    nickname: 'userTest14',
    name: 'Fourteen',
    picture: 'https://picsum.photos/200?random=14',
    enabled: true
  },
  {
    id: UuidHandler.createUuid(),
    email: 'user15@email.com',
    password: '123456',
    nickname: 'userTest15',
    name: 'Fifteen',
    picture: 'https://picsum.photos/200?random=15',
    enabled: false
  }
]