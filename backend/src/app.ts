import express from 'express'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import apiRouter from './routes/rsvp'
import adminRouter from './routes/admin'

const app = express()
const PORT = process.env.PORT ?? 3000

app.set('trust proxy', 1)
app.use(corsMiddleware)
app.use(express.json())
app.use('/api', apiRouter)
app.use('/api/admin', adminRouter)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})

export default app
