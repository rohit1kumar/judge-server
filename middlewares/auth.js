// import jwt from 'jsonwebtoken'
// import User from '../models/user.js'
// import httpStatus from '../helpers/httpStatus.js'

// export const generateAuthToken = (id) => {
// 	return jwt.sign({ _id: id }, process.env.JWT_SECRET)
// }

// export const isAuthenticated = async (req, res, next) => {
// 	const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

// 	if (!token) {
// 		return res.status(httpStatus.UNAUTHORIZED).json({
// 			success: false,
// 			message: 'Access Denied, No Token Provided'
// 		})
// 	}

// 	try {
// 		const decoded = jwt.verify(token, process.env.JWT_SECRET)
// 		req.user = await User.findById(decoded._id)
// 		next()
// 	} catch (error) {
// 		if (error instanceof jwt.JsonWebTokenError) {
// 			return res.status(httpStatus.UNAUTHORIZED).json({
// 				success: false,
// 				message: 'Invalid Token'
// 			})
// 		} else if (error instanceof jwt.TokenExpiredError) {
// 			return res.status(httpStatus.UNAUTHORIZED).json({
// 				success: false,
// 				message: 'Token Expired'
// 			})
// 		}

// 		console.error(error)
// 		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
// 			success: false,
// 			message: 'Something Went Wrong'
// 		})
// 	}
// }
