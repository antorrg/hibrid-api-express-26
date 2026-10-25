import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'


export class Image extends Model<
  InferAttributes<Image>, 
  InferCreationAttributes<Image> 
>{
  declare id: CreationOptional<string>
  declare imageUrl: string
}

export default (sequelize: Sequelize) => {
  Image.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      imageUrl: {
        type: DataTypes.STRING,
        unique:true,
        allowNull: false
      }
    }, {
      sequelize,
      tableName: 'images',
      timestamps: false
    })
  return Image
}
