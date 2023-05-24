import bcrypt from 'bcrypt'
import User from '../models/user.js'
import httpStatus from '../helpers/httpStatus.js'
import { generateAuthToken } from '../middlewares/auth.js'

export const registerUser = async (req, res) => {
	try {
		let { name, email, password } = req.body

		let user = await User.exists({ email: email })
		if (user) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Email already in use'
			})
		}

		password = await bcrypt.hash(password, 10) // 10 is salt rounds

		user = await User.create({ name, email, password })
		// create a token
		const token = await generateAuthToken(user._id)

		const options = {
			//options for the cookie
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //90 days
			httpOnly: true
		}

		return res.status(httpStatus.CREATED).cookie('token', token, options).json({
			success: true,
			message: 'User registered successfully',
			token: token
		})
	} catch (err) {
		console.log(err)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something went wrong',
			error: err.message
		})
	}
}

export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({ email: email }).select('+password')
		if (!user) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Email does not exist'
			})
		}
		const isPasswordMatch = await bcrypt.compare(password, user.password)
		if (!isPasswordMatch) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Password does not match'
			})
		}
		const token = generateAuthToken(user._id)
		const options = {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			httpOnly: true
		}
		return res.status(httpStatus.OK).cookie('token', token, options).json({
			success: true,
			message: 'User logged in successfully',
			token: token
		})
	} catch (err) {
		console.log(err)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something went wrong',
			error: err.message
		})
	}
}

export const logoutUser = async (req, res) => {
	try {
		res
			.status(httpStatus.OK)
			.cookie('token', null, { expires: new Date(Date.now()), httpOnly: true }) //delete the cookie
			.json({
				success: true,
				message: 'User logged out successfully'
			})
	} catch (error) {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something went wrong'
		})
	}
}
