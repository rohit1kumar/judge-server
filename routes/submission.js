import express from 'express'
import { submitCode, getSubmissionStatus } from '../controllers/submission.js'
// import {
//     registerValidation,
//     loginValidation,
//     validate
// } from '../middlewares/validator.js'
// import { isAuthenticated } from '../middlewares/auth.js'

const router = express.Router()

router.post('/run', submitCode)
router.get('/status/:id', getSubmissionStatus)

export default router
