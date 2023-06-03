import httpStatus from './httpStatus.js'

const routeNotFound = (req, res) => {
	return res.status(httpStatus.NOT_FOUND).json({
		success: false,
		message: 'route does not exist'
	})
}
const methodNotAllowed = (req, res) => {
	return res.status(httpStatus.METHOD_NOT_ALLOWED).json({
		success: false,
		message: 'method not allowed'
	})
}

export { routeNotFound, methodNotAllowed }
