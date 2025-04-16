const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
	const cookies = req.cookies;
	const token = cookies.authToken;
	if (!cookies || !token) {
		return res.status(401).json({ error: 'Cookies are required' });
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	if (!decoded) {
		return res.status(401).json({ error: 'Invalid token' });
	}

	req.auth = decoded;
	next();
}

module.exports = authMiddleware;