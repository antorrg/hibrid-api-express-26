import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class VariantProduct extends
  Model<
  InferAttributes<VariantProduct>, 
  InferCreationAttributes<VariantProduct> 
>{
  declare id: CreationOptional<string>
  declare productId: CreationOptional<string>
  declare picture: string
  declare text: string
  declare enabled: CreationOptional<boolean>
}


export default (sequelize: Sequelize) => {
  VariantProduct.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      enabled:{
        type: DataTypes.BOOLEAN,
        defaultValue:true
      }
    },{
      sequelize,
      tableName: 'variant_product',
      timestamps: true
    })
  return VariantProduct
}
