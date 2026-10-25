import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class VideoGroup extends
  Model<
  InferAttributes<VideoGroup>, 
  InferCreationAttributes<VideoGroup> 
>{
  declare id: CreationOptional<string>
  declare title: string
  declare productId: string
  declare enabled: CreationOptional<boolean>
}

export default (sequelize:Sequelize) => {
  VideoGroup.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      title: { type: DataTypes.STRING, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
   
    },{
      sequelize,
      tableName: 'video_group',
      timestamps: false
    })
  return VideoGroup
}