const auth = require('../middlewares/auth');
const Like = require('../models/like');

const router = require('express').Router();

// public API

router.use(auth);
// protected API (only authenticated users can access)

router.post('/', async (req, res) => {
    const { postId } = req.body;

	if (!postId) {
		res.status(400).json({ error: 'postId is required' });
		return;
	}

	const { id: user_id } = req.auth;
	if (!user_id) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		const liked = await Like.create(user_id, postId);
		res.status(201).json({ liked });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.delete('/', async (req, res) => {
	const { postId } = req.body;

	if (!postId) {
		res.status(400).json({ error: 'postId is required' });
		return;
	}

	const { id: user_id } = req.auth;
	if (!user_id) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		const disliked = await Like.delete(user_id, postId);
		res.status(200).json({ disliked });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;