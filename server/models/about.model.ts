import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'


export class About 
  extends Model<
    InferAttributes<About>, 
  InferCreationAttributes<About>>{
  declare id: CreationOptional<string>
  declare title: string
  declare picture: string 
  declare text: string 
  declare imgShow: CreationOptional<boolean>
  declare enabled: CreationOptional<boolean>
}

export default (sequelize: Sequelize) => {
  About.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: true
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      imgShow: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      scopes: {
        enabledOnly: {
          where: {
            enabled: true
          }
        },
        allRecords: {} // No aplica ningún filtro
      },
      sequelize,
      tableName: 'about',
      timestamps: false
    })
  return About
}
