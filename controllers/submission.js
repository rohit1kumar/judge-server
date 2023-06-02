import httpStatus from '../helpers/httpStatus.js'
import rabbit from '../helpers/rabbit.js'
import { v4 as uuid } from 'uuid'
import redisClient from '../helpers/redis.js'

export const submitCode = async (req, res) => {
	try {
		const { code, lang } = req.body
		if (code === undefined) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Empty Code Field'
			})
		}
		// assign uuid to each request to that we can track the request
		const id = uuid()
		const data = {
			id,
			code,
			lang
		}
		await rabbit.sendToQueue('MS_TM_Q', data)
		return res.status(httpStatus.ACCEPTED).json({
			success: true,
			message: 'Code execution pending',
			requestId: id
		})
	} catch (error) {
		console.log(error)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Internal Server Error'
		})
	}
}

export const getSubmissionStatus = async (req, res) => {
	try {
		const { id } = req.params
		const result = await redisClient.get(id)
		console.log(result)
		if (result === null) {
			return res.status(httpStatus.NOT_FOUND).json({
				success: false,
				message: 'Submission not found'
			})
		}
		return res.status(httpStatus.OK).json({
			success: true,
			message: 'Submission found',
			data: result
		})
	} catch (error) {
		console.log(error)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Internal Server Error'
		})
	}
}
