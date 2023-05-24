import { body, validationResult } from 'express-validator'
import httpStatus from '../helpers/httpStatus.js'

export const registerValidation = () => {
	return [
		body('name').trim().not().isEmpty().withMessage('Name is required'),
		body('email')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Email is required')
			.bail()
			.isEmail()
			.withMessage('Email is not valid')
			.bail()
			.isString()
			.withMessage('Email must be a string'),
		body('password')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Password is required')
			.bail()
			.isString()
			.withMessage('Password must be a string')
	]
}
export const loginValidation = () => {
	return [
		body('email')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Email is required')
			.bail()
			.isEmail()
			.withMessage('Email is not valid')
			.bail()
			.isString()
			.withMessage('Email must be a string'),
		body('password')
			.trim()
			.not()
			.isEmpty()
			.withMessage('Password is required')
			.bail()
			.isString()
			.withMessage('Password must be a string')
	]
}
export const validate = (req, res, next) => {
	const errors = validationResult(req)
	if (errors.isEmpty()) {
		return next()
	}

	const extractedErrors = []
	errors.array().map((err) => extractedErrors.push(`${err.msg}`))
	const errorMessage = extractedErrors.join(', ')
	return res.status(httpStatus.BAD_REQUEST).json({
		success: false,
		message: 'Validation Error',
		error: errorMessage
	})
}
