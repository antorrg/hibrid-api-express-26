import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'


export class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare sid: string
  declare expires: Date
  declare data: string
  declare createdAt?: CreationOptional<Date>
  declare updatedAt?: CreationOptional<Date>
}

export function initSessionModel(sequelize: Sequelize) {
  Session.init(
    {
      sid: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'sessions',
      indexes: [
        {
          fields: ['expires']
        }
      ]
    }
  )
  return Session
}

export default initSessionModel
