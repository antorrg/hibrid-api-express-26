import express, { type Request, type Response } from 'express'
import { sessionMiddleware } from '../session.js'
import { csrfProtection, setCsrfToken, verifyCsrfToken, isAuthenticated, authorize, UserRole, Auth } from '../authMiddlewares.js'
import cookieParser from 'cookie-parser'
import { errorHandler } from '../../../configs/errors.js'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(sessionMiddleware)
app.use(csrfProtection)   // inicializa req.session.csrfSecret
app.use(setCsrfToken)     // escribe cookie XSRF-TOKEN
app.use(verifyCsrfToken)  // bloquea mutantes sin token válido

app.post('/login', async(req: Request, res: Response) => {
  const { user } = req.body
  await Auth.login(req, user)
  res.status(200).json({ success: true, message: 'Logged in' })
})

app.post('/logout', async(req: Request, res: Response) => {
  await Auth.logout(req)
  res.status(200).json({ success: true, message: 'Logged out' })
})

app.get('/csrf', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'CSRF token set' })
})

app.get('/protected', isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Passed middleware', user: req.session.user })
})

app.get('/admin', authorize(UserRole.ADMIN), (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Passed middleware' })
})

app.use(errorHandler)

export default app