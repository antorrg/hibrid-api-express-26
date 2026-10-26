import express from 'express'

const mvcRoutes = express.Router()
mvcRoutes.get('/saludo', (req, res) => {
  res.status(200).send('Aca estoy, vivito y coleando')
})

export default mvcRoutes