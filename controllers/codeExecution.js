import httpStatus from '../helpers/httpStatus.js'
import generateFile from '../helpers/generateFile.js'
import executePy from '../helpers/executePy.js'

export const runCode = async (req, res) => {
	try {
		const { code, lang } = req.body
		if (code === undefined) {
			return res.status(httpStatus.BAD_REQUEST).json({
				success: false,
				message: 'Empty Code Field'
			})
		}
		const filepath = await generateFile(lang, code)
		let output
		if (lang === 'py') {
			output = await executePy(filepath)
		}
		return res.status(httpStatus.OK).json({
			success: true,
			data: output
		})
	} catch (error) {
		console.log(error)
		return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: 'Internal Server Error'
		})
	}
}

// export const saveCode = async (req, res) => {
//     const { code, lang, stdin } = req.body
//     if (code === undefined) {
//         return res.status(httpStatus.BAD_REQUEST).json({
//             success: false,
//             message: 'Empty Code Field'
//         })
//     }

// }
