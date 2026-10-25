import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class Video extends
  Model<
  InferAttributes<Video>, 
  InferCreationAttributes<Video>
>{
  declare id:string
  declare videoGroupId:string
  declare name: string
  declare youTubeId: string
  declare enabled: CreationOptional<boolean>
}

export default (sequelize:Sequelize) => {
  Video.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      videoGroupId: {
        type: DataTypes.UUID,
        allowNull: false 
      },
      name: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      youTubeId: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      } 
    },{
      sequelize,
      tableName: 'video',
      timestamps: true
    })
  return Video
}