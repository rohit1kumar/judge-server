// Import necessary modules
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import express from 'express'

// Import custom modules
import connectDB from './helpers/db.js'
import httpStatus from './helpers/httpStatus.js'
import errorHandler, {
	routeNotFound,
	handleFatalError,
	gracefulShutdown
} from './helpers/errorHandler.js'
import submissionRouter from './routes/submission.js'
import userRouter from './routes/user.js'

// Setup dotenv
dotenv.config()

// Setup Express app
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Connect to the database
connectDB()

// Define routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/codes', submissionRouter)

// Health check endpoint
app.get(`/health`, (req, res) => {
	res.status(httpStatus.OK).send('OK')
})

// Handle 404
app.use('*', routeNotFound)

// Handle errors
app.use(errorHandler)

// Start the server
const port = process.env.PORT || 4000

app.listen(port, () => {
	console.log(`Server listening on port ${port}`)
})

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)
