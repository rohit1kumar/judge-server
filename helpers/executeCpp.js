import { exec } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const outputPath = path.join(__dirname, 'outputs')

const executeCpp = async (filepath) => {
	try {
		await fs.access(outputPath)
	} catch {
		await fs.mkdir(outputPath, { recursive: true })
	}

	const jobId = path.basename(filepath).split('.')[0]
	const outPath = path.join(outputPath, `${jobId}.out`)

	return new Promise((resolve, reject) => {
		exec(
			`g++ ${filepath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out`,
			(error, stdout, stderr) => {
				error && reject({ error, stderr })
				stderr && reject(stderr)
				resolve(stdout)
			}
		)
	})
}

export default executeCpp
