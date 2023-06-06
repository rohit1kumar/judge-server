import httpStatus from '../helpers/httpStatus.js'
import rabbit from '../helpers/rabbit.js'
import { v4 as uuid } from 'uuid'
import redisClient from '../helpers/redis.js'
import Submission from '../models/submission.js'
import mongoose from 'mongoose'

export const submitCode = async (req, res) => {
	try {
		const { code, lang } = req.body
		if (code === undefined) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Empty Code Field'
			})
		}
		const supportedLangs = ['py', 'js', 'cpp', 'java']
		if (!supportedLangs.includes(lang)) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Unsupported Language'
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
		const resp = {
			status: 'pending',
			result: null
		}
		await redisClient.set(id, JSON.stringify(resp))
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
				message: 'Submission not found, or result expired'
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

export const saveSubmission = async (req, res) => {
	const { code, lang } = req.body
	// const { id } = req.user
	try {
		// save the code in the database
		const submission = await Submission.create({
			// userId: id,
			code,
			lang
			// visibliity
		})

		return res.status(httpStatus.CREATED).json({
			success: true,
			message: 'Submission saved successfully',
			data: submission
		})
	} catch (error) {
		console.log(error)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Internal Server Error'
		})
	}
}

// export const getSavedSubmissions = async (req, res) => {
// 	const { id } = req.user
// 	try {
// 		const submissions = await Submission.find({ userId: id })
// 		return res.status(httpStatus.OK).json({
// 			success: true,
// 			message: 'Submissions fetched successfully',
// 			data: submissions
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
// 			success: false,
// 			message: 'Internal Server Error'
// 		})
// 	}
// }

export const getSubmissionById = async (req, res) => {
	const { id } = req.params
	try {
		// check if id is a valid object id
		if (!mongoose.isValidObjectId(id)) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Invalid Submission Id'
			})
		}
		const submission = await Submission.findById(id)
		if (!submission) {
			return res.status(httpStatus.NOT_FOUND).json({
				success: false,
				message: 'Submission not found for the given id'
			})
		}
		// check if visibliity is public or the user is the owner of the submission
		// if (
		// 	submission.visibliity === 'public' ||
		// 	submission.userId === req.user.id
		// ) {
		return res.status(httpStatus.OK).json({
			success: true,
			message: 'Submission fetched successfully',
			data: submission
		})
		// }
		// return res.status(httpStatus.UNAUTHORIZED).json({
		// 	success: false,
		// 	message:
		// 		'Unauthorized to access the submission, make sure the submission is public or you are the owner of the submission'
		// })
	} catch (error) {
		console.log(error)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Internal Server Error'
		})
	}
}

// export const updateSubmission = async (req, res) => {
// 	const { id } = req.params
// 	const { code, lang, visibliity } = req.body
// 	try {
// 		// check if user is the owner of the submission
// 		const submission = await Submission.findById(id)
// 		if (!submission) {
// 			return res.status(httpStatus.NOT_FOUND).json({
// 				success: false,
// 				message: 'Submission not found for the given id'
// 			})
// 		}
// 		if (submission.userId.toString() !== req.user.id) {
// 			return res.status(httpStatus.UNAUTHORIZED).json({
// 				success: false,
// 				message:
// 					'Unauthorized to update the submission, make sure you are the owner of the submission'
// 			})
// 		}
// 		if (code) submission.code = code
// 		if (lang) submission.lang = lang
// 		if (visibliity) submission.visibliity = visibliity
// 		await submission.save()
// 		return res.status(httpStatus.OK).json({
// 			success: true,
// 			message: 'Submission updated successfully',
// 			data: submission
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
// 			success: false,
// 			message: 'Internal Server Error'
// 		})
// 	}
// }

// export const deleteSubmission = async (req, res) => {
// 	const { id } = req.params
// 	try {
// 		const submission = await Submission.findById(id)
// 		if (!submission) {
// 			return res.status(httpStatus.NOT_FOUND).json({
// 				success: false,
// 				message: 'Submission not found for the given id'
// 			})
// 		}
// 		if (submission.userId.toString() !== req.user.id) {
// 			return res.status(httpStatus.UNAUTHORIZED).json({
// 				success: false,
// 				message:
// 					'Unauthorized to delete the submission, make sure you are the owner of the submission'
// 			})
// 		}
// 		await submission.deleteOne({ _id: id })
// 		return res.status(httpStatus.OK).json({
// 			success: true,
// 			message: 'Submission deleted successfully'
// 		})
// 	} catch (error) {
// 		console.log(error)
// 		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
// 			success: false,
// 			message: 'Internal Server Error'
// 		})
// 	}
// }
