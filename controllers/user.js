import bcrypt from 'bcrypt'
import User from '../models/user.js'
import httpStatus from '../helpers/httpStatus.js'
import { generateAuthToken } from '../middlewares/auth.js'

export const registerUser = async (req, res) => {
	try {
		let { name, email, password } = req.body

		const isUniqueEmail = await User.exists({ email: email })
		if (isUniqueEmail) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Email already in use'
			})
		}

		password = await bcrypt.hash(password, 10) // 10 is salt rounds

		const user = await User.create({ name, email, password })
		// create a token
		const token = await generateAuthToken(user._id)

		const options = {
			//options for the cookie
			expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //90 days
			httpOnly: true
		}

		return res.status(httpStatus.CREATED).cookie('token', token, options).json({
			success: true,
			message: 'User registered successfully'
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
