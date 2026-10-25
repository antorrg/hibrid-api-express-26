import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class Client extends
  Model<
  InferAttributes<Client>, 
  InferCreationAttributes<Client>
>{
  declare id: CreationOptional<string>
  declare name: string
  declare url: string
  declare enabled: CreationOptional<boolean>
}
export default (sequelize:Sequelize) => {
  Client.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },{
    sequelize,
    tableName: 'Client',
    timestamps: true
  })
  return Client
}
