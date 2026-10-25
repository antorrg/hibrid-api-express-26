import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export class Log extends Model<
  InferAttributes<Log>,
  InferCreationAttributes<Log>
> {
  declare id: string
  declare levelName: LogLevel
  declare levelCode: number
  declare message: string
  declare type: string | null
  declare status: number | null
  declare stack: string | null
  declare contexts: CreationOptional<string[]>
  declare pid: CreationOptional<number>
  declare time: CreationOptional<number | null>
  declare hostname: string | null
  declare keep: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

export default (sequelize: Sequelize) => {
  Log.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      levelName: {
        type: DataTypes.ENUM(
          LogLevel.DEBUG,
          LogLevel.INFO,
          LogLevel.WARN,
          LogLevel.ERROR,
          LogLevel.FATAL
        ),
        allowNull: false
      },
      levelCode: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      stack: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      contexts: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: []
      },
      pid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      time: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      hostname: {
        type: DataTypes.STRING,
        allowNull: true
      },
      keep: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      tableName: 'logs',
      timestamps: true
    }
  )

  return Log
}