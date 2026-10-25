import { User as UserDb } from '../../models/user.model.js'
import type { IUserRepository, IUser } from './User.interfaces.js'
import { BaseRepository } from '../../shared/repositories/BaseRepository.js'
import { User, type UserProps } from './User.js'
import { processError, throwError, ERROR_CODE } from '../../configs/errors.js'

export class UserRepository implements IUserRepository {
  private base: BaseRepository<UserProps, UserProps, Partial<UserProps>, UserDb>

  constructor(model: typeof UserDb = UserDb) {
    this.base = new BaseRepository<UserProps, UserProps, Partial<UserProps>, UserDb>(
      model,
      this.mapToRecord,
      this.mapToRecord,
      'User',
      'email'
    )
  }

  // ==========================================
  // HELPER: Map from db to user props
  // ==========================================
  private mapToRecord(record: UserDb): UserProps {
    return {
      id: record.id,
      email: record.email,
      password: record.password,
      role: record.role ?? 'USER',
      name: record.name ?? '',
      nickname: record.nickname ?? '',
      picture: record.picture ?? '',
      enabled: record.enabled ?? true
    }
  }

  private mapToDomain(record: UserProps): User {
    return new User(record)
  }

  private mapToPublic(record: UserProps): IUser {
    return {
      id: record.id,
      email: record.email,
      role: record.role,
      name: record.name,
      nickname: record.nickname,
      picture: record.picture,
      enabled: record.enabled
    }
  }

  // ==========================================
  // BASIC CRUD
  // ==========================================

  async save(userDomain: User): Promise<void> {
    try {
      const data = userDomain.toPersistence()
      const existingUser = await this.base.findByField(data.email, 'email')
      if (existingUser) {
        throwError(ERROR_CODE.DUPLICATE_VALUE, 'This email already exists')
      }
      await this.base.create(data)
    } catch (error) {
      return processError(error, 'Error saving user')
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const record = await this.base.findByField(id, 'id')
      return record ? this.mapToDomain(record) : null
    } catch (error) {
      return processError(error, `Error searching user id: ${id}`)
    }
  }

  async getPublicById(id: string): Promise<IUser | null> {
    try {
      const record = await this.base.findByField(id, 'id')
      return record ? this.mapToPublic(record) : null
    } catch (error) {
      return processError(error, `Error searching user id: ${id}`)
    }
  }

  async getAll(): Promise<IUser[]> {
    try {
      const records = await this.base.getAll()
      return records.map(record => this.mapToPublic(record))
    } catch (error) {
      return processError(error, 'Error searching users')
    }
  }

  async update(id: string, userDomain: User): Promise<IUser> {
    try {
      const data = userDomain.toPersistence()
      const updated = await this.base.update(id, data)
      return this.mapToPublic(updated)
    } catch (error) {
      return processError(error, 'Error updating user')
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.base.delete(id)
    } catch (error) {
      return processError(error, `Error deleting user ${id}`)
    }
  }

  // ==========================================
  // SPECIFIC METHODS
  // ==========================================

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.base.findByField(email, 'email')
      return result ? this.mapToDomain(result) : null
    } catch (error) {
      return processError(error, `Error searching user for email ${email}`)
    }
  }
}