import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controllers/user.js'
import {
	registerValidation,
	loginValidation,
	validate
} from '../middlewares/validator.js'
const router = express.Router()

router.post('/register', registerValidation(), validate, registerUser)
router.post('/login', loginValidation(), validate, loginUser)
router.post('/logout', logoutUser)

export default router
