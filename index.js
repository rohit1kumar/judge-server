import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import express from 'express'
import mongoose from 'mongoose'

import connectDB from './helpers/db.js'
import httpStatus from './helpers/httpStatus.js'
import submissionRouter from './routes/submission.js'
import userRouter from './routes/user.js'
import { routeNotFound } from './helpers/errorHandler.js'

dotenv.config()
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

connectDB()

app.use('/api/v1/users', userRouter)
app.use('/api/v1/codes', submissionRouter)
app.use('*', routeNotFound)

app.get(`/health`, (req, res) => {
	res.status(httpStatus.OK).send('OK')
})

app.use((err, req, res, next) => {
	console.error(err)
	res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
		success: false,
		message: 'Something went wrong',
		error: err.message
	})
	next()
})

const port = process.env.PORT || 4000

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`)
})

process.on('SIGTERM', async () => {
	await mongoose.disconnect()
	process.exit(0)
})
process.on('SIGINT', async () => {
	await mongoose.disconnect()
	process.exit(0)
})

process.on('uncaughtException', (err) => {
	console.log('UncaughtException', err)
	process.exit(1)
})
process.on('unhandledRejection', (err) => {
	console.log('unhandledRejection', err)
})
