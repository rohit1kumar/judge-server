// import express from 'express'
// import {
// 	registerUser,
// 	loginUser,
// 	logoutUser,
// 	getLogginUser,
// 	updateUser
// } from '../controllers/user.js'

// import {
// 	registerValidation,
// 	loginValidation,
// 	validate
// } from '../middlewares/validator.js'

// import { isAuthenticated } from '../middlewares/auth.js'

// import { methodNotAllowed } from '../helpers/errorHandler.js'

// const router = express.Router()

// // User Profile Route
// router.get('/profile', isAuthenticated, getLogginUser)

// // User Registration Route
// router.post('/register', registerValidation(), validate, registerUser)

// // User Login Route
// router.post('/login', loginValidation(), validate, loginUser)

// // User Logout Route
// router.post('/logout', logoutUser)

// // Update User Profile Route
// router.patch('/update', isAuthenticated, updateUser)

// // Catch All for Invalid HTTP Methods
// router.all('*', methodNotAllowed)

// export default router
