// Import necessary modules
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import express from 'express'
import Sentry from '@sentry/node'
import cors from 'cors'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

// Import custom modules
import connectDB from './helpers/db.js'
import httpStatus from './helpers/httpStatus.js'
import errorHandler, {
	routeNotFound,
	handleFatalError,
	gracefulShutdown
} from './helpers/errorHandler.js'
import submissionRouter from './routes/submission.js'
// import userRouter from './routes/user.js'

// Setup dotenv
dotenv.config()
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false // Disable the `X-RateLimit-*` headers
})

// Setup Express app
const app = express()

app.use(limiter)
app.use(morgan('tiny'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors())

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true }),
		// enable Express.js middleware tracing
		new Sentry.Integrations.Express({ app }),
		// Automatically instrument Node.js libraries and frameworks
		...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()
	],
	tracesSampleRate: 1.0
})

// Connect to the database
connectDB()

// Define routes
// app.use('/api/v1/users', userRouter)
app.use('/api/v1/codes', submissionRouter)

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(httpStatus.OK).send('OK')
})

// Handle 404
app.use('*', routeNotFound)

// Sentry error handler to track errors
if (process.env.NODE_ENV === 'production') {
	app.use(Sentry.Handlers.errorHandler())
}

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
