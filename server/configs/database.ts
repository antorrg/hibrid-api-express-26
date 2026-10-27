import envConfig from './envConfig.js'
import logger from './logger.js'
import { Sequelize } from 'sequelize'
import modelsDefinition from '../models/index.model.js'
import { userSeed } from '../features/user/userSeed.js'

const sequelize = new Sequelize(envConfig.DatabaseUrl, {
  logging:false,
  native:false
})


const User = modelsDefinition.User(sequelize)
const Log = modelsDefinition.Log(sequelize)
const Session = modelsDefinition.Session(sequelize)
const FrontPage = modelsDefinition.FrontPage(sequelize)
const Product = modelsDefinition.Product(sequelize)
const VariantProduct = modelsDefinition.VariantProduct(sequelize)
const VideoGroup = modelsDefinition.VideoGroup(sequelize)
const Video = modelsDefinition.Video(sequelize)
const Client = modelsDefinition.Client(sequelize)
const ApiKey = modelsDefinition.ApiKey(sequelize)
const Letter = modelsDefinition.Letter(sequelize)
const Image = modelsDefinition.Image(sequelize)

Product.hasMany(VariantProduct, {
  foreignKey: 'productId',
  as: 'variants',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})
VariantProduct.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})

VideoGroup.hasMany(Video, {
  foreignKey: 'videoGroupId',
  as: 'videos',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})
Video.belongsTo(VideoGroup, {
  foreignKey: 'videoGroupId',
  as: 'videoGroup',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})

Client.hasMany(ApiKey, {
  foreignKey: 'clientId',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})

ApiKey.belongsTo(Client, {
  foreignKey: 'clientId',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'

})
//========================================

function getNameDb(dbUri:string):string {
  return dbUri.split('/').slice(-1).join()
}

async function startUp(syncDb: boolean = false, rewrite: boolean = false) {
  try {
    await sequelize.authenticate()
    const successMessage =`Database postgreSQL "${getNameDb(envConfig.DatabaseUrl)}" initialized successfully!!`
    console.log(successMessage)
    if (envConfig.Status !== 'production' && syncDb) {
      try {
        await sequelize.sync({ force: rewrite })
        if(envConfig.Status !== 'test'){
          await userSeed()}
        const message = `Synced database ${getNameDb(envConfig.DatabaseUrl)}: "force ${rewrite}"`
        logger.info(message)
      } catch (error) {
        logger.error(error)
        //console.error(`❗Error syncing database ${getNameDb(envConfig.DatabaseUrl)}`, error)
        throw error
      }
    }
    logger.info(successMessage)
  } catch (error) {
    //console.error('❌ Error conecting database!', error)
    logger.error(error)
    throw error
  }
}
const closeDatabase = async() => {
  await sequelize.close()
  logger.info('🛑 Database disconnect')
}


export {
  User,
  Log,
  Session,
  FrontPage,
  Product,
  VariantProduct,
  VideoGroup,
  Video,
  Image,
  Client, 
  ApiKey,
  Letter,
  sequelize,
  startUp,
  closeDatabase
}