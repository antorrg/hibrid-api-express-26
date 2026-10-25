import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class FrontPage extends Model<InferAttributes<FrontPage>, InferCreationAttributes<FrontPage>>{
  declare id: CreationOptional<number>
  declare picture: string
  declare title: string
  declare info_header: string
  declare description: string
  declare enabled: CreationOptional<boolean>
}

export default (sequelize: Sequelize) => {
  FrontPage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      info_header:{
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      enabled:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
      }
    },{
      sequelize,
      tableName: 'front_page',
      timestamps: true
    })
  return FrontPage
}