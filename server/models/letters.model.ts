import { Model, DataTypes } from 'sequelize'
import type { 
  Sequelize,
  CreationOptional,
  InferAttributes, 
  InferCreationAttributes 
} from 'sequelize'

export class Letter extends
  Model<
  InferAttributes<Letter>, 
  InferCreationAttributes<Letter> 
>{
  declare id: CreationOptional<string>
  declare mensaje: string
  declare tema: string
  declare aprobada: CreationOptional<boolean>
}

export default (sequelize: Sequelize) => {
  Letter.init( {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    mensaje: {
      type: DataTypes.TEXT
    },
    tema: {
      type: DataTypes.TEXT
    },
    aprobada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },{
    sequelize,
    tableName: 'letters',
    timestamps: true
  })
  return Letter
}