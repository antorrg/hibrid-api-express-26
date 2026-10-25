import type { User } from './User.js'

export type IUser = ReturnType<User['toDTO']>;
export interface IUserRepository {
  // CRUD Básico (Hablando siempre en Entidades de Dominio 'User')
  save(user: User): Promise<void>;
  update(id: string, user: User): Promise<IUser>;
  getById(id: string): Promise<User | null>;
  getAll(): Promise<IUser[]>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  getPublicById(id:string): Promise<IUser | null>
}