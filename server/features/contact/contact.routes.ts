import express from 'express'
import { ContactController } from './ContactController.js'

const contactRouter = express.Router()
contactRouter.post(
  '/',
  ContactController.sendContactEmail
)
export default contactRouter