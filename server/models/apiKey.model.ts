import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class ApiKey extends
  Model<
  InferAttributes<ApiKey>, 
  InferCreationAttributes<ApiKey>
>{
  declare id: CreationOptional<string>
  declare clientId: CreationOptional<string>
  declare keyId: string
  declare keyHash: string
  declare enabled: CreationOptional<boolean>
}

export default (sequelize: Sequelize) => {
  ApiKey.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    keyId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    keyHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    tableName: 'api_key',
    timestamps: true
  })
  return ApiKey
}
