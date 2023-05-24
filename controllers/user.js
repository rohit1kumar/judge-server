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
				message: 'Email Already In Use'
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

		return res
			.status(httpStatus.CREATED)
			.cookie('token', token, options)
			.json({
				success: true,
				message: 'User Registered Successfully',
				data: {
					token: token
				}
			})
	} catch (err) {
		console.log(err)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something Went Wrong',
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
				message: 'Email Does Not Exist'
			})
		}
		const isPasswordMatch = await bcrypt.compare(password, user.password)
		if (!isPasswordMatch) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Password Does Not Match'
			})
		}
		const token = generateAuthToken(user._id)
		const options = {
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
			httpOnly: true
		}
		return res
			.status(httpStatus.OK)
			.cookie('token', token, options)
			.json({
				success: true,
				message: 'User Logged In Successfully',
				data: {
					token: token
				}
			})
	} catch (err) {
		console.log(err)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something Went Wrong',
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
				message: 'User Logged Out Successfully'
			})
	} catch (error) {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something Went Wrong'
		})
	}
}
export const updateUser = async (req, res) => {
	const { name, email } = req.body
	const userId = req.user._id
	const user = {}
	if (name) user.name = name
	if (email) user.email = email
	try {
		await User.findOneAndUpdate({ _id: userId }, { $set: user }, { new: true })
		console.log(user)
		res.status(httpStatus.OK).json({
			success: true,
			message: 'User Updated Successfully'
		})
	} catch (error) {
		console.log(error)
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something Went Wrong'
		})
	}
}
export const getLogginUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
		res.status(httpStatus.OK).json({
			success: true,
			message: 'User Details Fetched Successfully',
			data: user
		})
	} catch (error) {
		res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Something Went Wrong'
		})
	}
}
