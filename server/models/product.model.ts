import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'
import type { VariantProduct } from './variantProduct.model.js'

export class Product extends
  Model<
  InferAttributes<Product>, 
  InferCreationAttributes<Product>
>{
  declare id: CreationOptional<string>
  declare title: string
  declare picture: string
  declare logo: string
  declare info_header: string
  declare info_body: string
  declare isAlive: CreationOptional<boolean>
  declare url: CreationOptional<string>
  declare enabled: CreationOptional<boolean>
  declare variants?: VariantProduct[]
}


export default (sequelize: Sequelize) => {
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      title: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      picture: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      info_header: {
        type:DataTypes.STRING, 
        allowNull: false
      },
      info_body:{
        type: DataTypes.TEXT, 
        allowNull: true
      },
      isAlive:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      url: { 
        type: DataTypes.STRING, 
        allowNull: true,
        defaultValue: 'NoUrl'
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },{
      sequelize,
      tableName: 'product',
      timestamps: true
    })
  return Product
}
