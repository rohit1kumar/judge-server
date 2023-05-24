import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { v4 as uuid } from 'uuid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dirCodes = join(__dirname, 'codes')

const generateFile = async (format, content) => {
	const jobId = uuid()
	const filename = `${jobId}.${format}`
	const filepath = join(dirCodes, filename)

	try {
		await fs.access(dirCodes)
	} catch {
		await fs.mkdir(dirCodes, { recursive: true })
	}

	try {
		await fs.writeFile(filepath, content)
	} catch (error) {
		console.error(`Error writing file: ${error}`)
		throw error
	}

	return filepath
}

export default generateFile
