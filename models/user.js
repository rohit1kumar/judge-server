import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			lowercase: true
		},
		email: {
			type: String,
			unique: true,
			required: true,
			lowercase: true
		},
		password: {
			type: String,
			required: true,
			select: false // to not return password in query results
		}
	},
	{
		timestamps: true
	}
)

export default mongoose.model('User', userSchema)
