import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export const generateAuthToken = (id) => {
	return jwt.sign({ _id: id }, process.env.JWT_SECRET)
}

export const isAuthenticated = async (req, res, next) => {
	try {
		const { token } = req.cookies

		if (!token) {
			//if token is not present in cookies
			return res.status(401).json({
				message: 'Please login first'
			})
		}

		const decoded = await jwt.verify(token, process.env.JWT_SECRET) //verifying token
		req.user = await User.findById(decoded._id) //setting user to req.user
		next()
	} catch (error) {
		res.status(500).json({
			message: error.message
		})
	}
}
