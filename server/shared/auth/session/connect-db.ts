import { type ModelStatic, type Model, Op } from 'sequelize'
import { Session } from '../../../configs/database.js'
import type { ISessionAdapter, DefaultFields } from './types.js'

class ConnectDb implements ISessionAdapter {
  public sessionModel: ModelStatic<Model>

  constructor(sessionModel = Session ) {
    this.sessionModel = sessionModel
  }
  async get(sid: string) {
    const record = await this.sessionModel.findOne({
      where: {
        sid,
        expires: {
          [Op.gt]: new Date()
        }
      }
    })
    if (!record) return null
    return record.toJSON ? record.toJSON() : record
  }

  async set(sid: string, defaults: DefaultFields) {
    await this.sessionModel.upsert({
      sid,
      ...defaults
    })
  }

  async touch(sid: string, expires: Date) {
    await this.sessionModel.update({ expires }, { where: { sid } })
  }

  async destroy(sid: string) {
    const session = await this.sessionModel.findOne({ where: { sid } })
    if (session) {
      await session.destroy()
    }
  }

  async length(): Promise<number> {
    return await this.sessionModel.count({
      where: {
        expires: {
          [Op.gt]: new Date()
        }
      }
    })
  }

  async clearExpiredSessions(now: Date = new Date()) {
    await this.sessionModel.destroy({
      where: {
        expires: {
          [Op.lt]: now
        }
      }
    })
  }
}

const sessionAdapter = new ConnectDb()
export default sessionAdapter
