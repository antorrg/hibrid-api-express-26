import express from 'express'
import { Validator } from 'req-valid-express'
import { VideoController } from './VideosController.js'
import { videoService } from '../../shared/dependencies.js'
import { UuidHandler } from '../../shared/utils/UuidHandler.js'
import * as sch from './video.schemas.js'

const controller = new VideoController(videoService)
const videoRouter = express.Router()

videoRouter.get(
  '/',
  Validator.validateQuery(sch.vgQuery),
  controller.getAllGroup
)
videoRouter.get(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.getGroupById
)
videoRouter.get(
  '/:id/video',
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.getVideo
)
videoRouter.post(
  '/',
  Validator.validateBody(sch.videoGroupCreate),
  controller.createGroup
)
videoRouter.post(
  '/video',
  Validator.validateBody(sch.videoCreate),
  controller.createVideo
)
videoRouter.put(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(sch.videoGroupUpdate),
  controller.updateGroup
)
videoRouter.patch(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  Validator.validateBody(sch.videoUpdate),
  controller.updateVideo
)
videoRouter.delete(
  '/:id',
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.deleteGroup
)
videoRouter.delete(
  '/:id/video',
  Validator.paramId('id', UuidHandler.uuidRegex),
  controller.deleteVideo
)

export default videoRouter