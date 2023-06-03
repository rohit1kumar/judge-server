import mongoose from 'mongoose'
import httpStatus from './httpStatus.js'
import redisClient from './redis.js'
import { stopConsuming, stopListening } from './rabbit.js'

const routeNotFound = (req, res) => {
	return res.status(httpStatus.NOT_FOUND).json({
		success: false,
		message: 'route does not exist'
	})
}

const methodNotAllowed = (req, res) => {
	return res.status(httpStatus.METHOD_NOT_ALLOWED).json({
		success: false,
		message: 'method not allowed'
	})
}

const errorHandler = (err, req, res, next) => {
	console.error(err)
	res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
		success: false,
		message: 'Something went wrong',
		error: process.env.NODE_ENV === 'development' ? err.stack : {}
	})
	next()
}

// Handle uncaught exceptions and rejections
function handleFatalError(err) {
	console.log('Fatal error occurred', err)
	process.exit(1)
}

// Handle graceful shutdown
async function gracefulShutdown() {
	console.log('Graceful shutdown started')
	await stopConsuming()
	await stopListening()
	await redisClient.disconnect()
	await mongoose.disconnect()
	process.exit(0)
}

export default errorHandler
export { routeNotFound, methodNotAllowed, handleFatalError, gracefulShutdown }
