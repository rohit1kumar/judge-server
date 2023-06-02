import { body, validationResult } from 'express-validator'

import httpStatus from '../helpers/httpStatus.js'

// Common validation steps are moved into a function
const validateEmail = (fieldName) => [
	body(fieldName)
		.trim()
		.notEmpty()
		.withMessage(
			`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
		)
		.bail()
		.isEmail()
		.withMessage(
			`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is not valid`
		)
		.bail()
		.isString()
		.withMessage(
			`${
				fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
			} must be a string`
		)
]

const validatePassword = (fieldName) => [
	body(fieldName)
		.trim()
		.notEmpty()
		.withMessage(
			`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
		)
		.bail()
		.isString()
		.withMessage(
			`${
				fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
			} must be a string`
		)
]

export const registerValidation = () => {
	return [
		...validateEmail('email'),
		...validatePassword('password'),
		body('name').trim().notEmpty().withMessage('Name is required')
	]
}

export const loginValidation = () => {
	return [...validateEmail('email'), ...validatePassword('password')]
}

export const codeValidation = () => {
	return [
		body('code')
			.trim()
			.notEmpty()
			.withMessage('Code is required')
			.bail()
			.isString()
			.withMessage('Code must be a string'),
		body('lang')
			.trim()
			.notEmpty()
			.withMessage('Language is required')
			.bail()
			.isString()
			.withMessage('Language must be a string')
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
