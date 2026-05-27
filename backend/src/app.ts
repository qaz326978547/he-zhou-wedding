import express from 'express'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/errorHandler'
import apiRouter from './routes/rsvp'

const app = express()
const PORT = process.env.PORT ?? 3000

app.set('trust proxy', 1)
app.use(corsMiddleware)
app.use(express.json())
app.use('/api', apiRouter)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})

export default app
