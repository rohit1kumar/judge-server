import express from 'express'
import { registerUser } from '../controllers/user.js'
import { registerValidation, validate } from '../middlewares/validator.js'
const router = express.Router()

router.post('/register', registerValidation(), validate, registerUser)

export default router
