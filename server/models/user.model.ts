import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional, 
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'
import type { UserRole } from '../shared/auth/authMiddlewares.js'

export class User extends Model<
InferAttributes<User>, 
InferCreationAttributes<User>
> {
  declare id: string
  declare email: string
  declare password: string
  declare nickname: string
  declare name: string
  declare picture: string
  declare role: CreationOptional<UserRole>
  declare enabled: CreationOptional<boolean>
}

export default (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM,
        values: ['OWNER', 'ADMIN', 'USER'],
        allowNull: false,
        defaultValue: 'USER'
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true
    }
  )
  return User
}