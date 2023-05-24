import express from 'express'
import { runCode } from '../controllers/codeExecution.js'
// import {
//     registerValidation,
//     loginValidation,
//     validate
// } from '../middlewares/validator.js'
// import { isAuthenticated } from '../middlewares/auth.js'

const router = express.Router()

router.post('/run', runCode)

export default router
