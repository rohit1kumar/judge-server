import express from 'express'
import {
	registerUser,
	loginUser,
	logoutUser,
	getLogginUser,
	updateUser
} from '../controllers/user.js'
import {
	registerValidation,
	loginValidation,
	validate
} from '../middlewares/validator.js'
import { isAuthenticated } from '../middlewares/auth.js'

const router = express.Router()

router.get('/profile', isAuthenticated, getLogginUser)
router.post('/register', registerValidation(), validate, registerUser)
router.post('/login', loginValidation(), validate, loginUser)
router.post('/logout', logoutUser)
router.patch('/update', isAuthenticated, updateUser)

export default router
