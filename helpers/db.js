import mongoose from 'mongoose'

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		console.log('Database connected sucessfully')
		return
	} catch (err) {
		console.log(err)
		return err
	}
}
export default connectDB
