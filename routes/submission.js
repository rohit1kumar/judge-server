import express from 'express'
import {
	submitCode,
	getSubmissionStatus,
	saveSubmission,
	getSavedSubmissions,
	getSubmissionById,
	updateSubmission,
	deleteSubmission
} from '../controllers/submission.js'
import { codeValidation, validate } from '../middlewares/validator.js'
import { isAuthenticated } from '../middlewares/auth.js'
import { methodNotAllowed } from '../helpers/errorHandler.js'

const router = express.Router()

// Dedicated to submissions.
router
	.route('/submissions')
	.post(isAuthenticated, codeValidation(), validate, submitCode) // execute the code.
	.get(isAuthenticated, getSavedSubmissions) // Get all saved submissions.

router
	.route('/submissions/:id')
	.get(isAuthenticated, getSubmissionById) // Get a specific submission.
	.patch(isAuthenticated, updateSubmission) // Update a specific submission.
	.delete(isAuthenticated, deleteSubmission) // Delete a specific submission.

router.route('/submissions/save').post(isAuthenticated, saveSubmission) // Save a submission.
router
	.route('/submissions/:id/status')
	.get(isAuthenticated, getSubmissionStatus) // Get the status of a specific submission.

router.all('*', methodNotAllowed)

export default router
