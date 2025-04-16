const auth = require('../middlewares/auth');
const Follow = require('../models/follow');
const router = require('express').Router();

// public API

router.use(auth);
// protected API (only authenticated users can access)

router.post('/', async (req, res) => {
    const { id } = req.body;

	if (!id) {
		res.status(400).json({ error: 'user_id is required' });
		return;
	}

	const { id: user_id } = req.auth;
	if (!user_id) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		const followed = await Follow.follow(user_id, id);
		res.status(201).json({ followed });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.delete('/', async (req, res) => {
	const { id } = req.body;

	if (!id) {
		res.status(400).json({ error: 'id is required' });
		return;
	}

	const { id: user_id } = req.auth;
	if (!user_id) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		const unfollowed = await Follow.unfollow(user_id, id);
		res.status(200).json({ unfollowed });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;