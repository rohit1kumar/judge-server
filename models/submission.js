import mongoose from 'mongoose'

const Schema = mongoose.Schema

const submissionSchema = new Schema(
	{
		// userId: {
		// 	type: Schema.Types.ObjectId,
		// 	ref: 'User',
		// 	required: [true, 'User ID is required']
		// },
		code: {
			type: String
		},
		lang: {
			type: String
		}
		// visibliity: {
		// 	type: String,
		// 	enum: ['public', 'private'],
		// 	default: 'private'
		// }
	},
	{
		timestamps: true
	}
)

const Submission = mongoose.model('Submission', submissionSchema)

export default Submission
