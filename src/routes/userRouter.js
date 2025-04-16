const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { email, password, username } = require('../middlewares/validators');
const validationResult = require('../middlewares/validationResult');
const auth = require('../middlewares/auth');

// public API
router.get('/searchUsers/:searchInput', async (req, res) => {
	const { searchInput } = req.params;
	if (!searchInput) {
		return res.status(400).json({ error: 'Username is required' });
	}

	try {
		const users = await User.searchUsers(searchInput) || [];
		res.status(200).json({users});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.getByEmail(email);
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        user.password = undefined; // remove password from user object

        const token = jwt.sign({
            id: user.id,
			username: user.username,
            role: user?.role || 'user',
        }, process.env.JWT_SECRET);

		res.status(200).cookie('authToken', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
		}).json({
			user
		});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', username, email, password, validationResult, async (req, res) => {
    const { username, displayname, email, password } = req.body;
	if (!username || !displayname || !email || !password) {
        res.status(400).json({ errors: {msg: 'All fields are required'} });
        return;
    }

    try {
        const user = await User.getByEmail(email);
        if (user) {
            res.status(400).json({ errors: {msg:  'Email already exists'} });
            return;
        }

		const existingUsername = await User.getByUsername(username);
		if (existingUsername) {
			res.status(400).json({ errors: {msg:  'Username already exists'} });
			return;
		}

        const newUser = await User.create(username, displayname, email, password);
        res.status(201).json({ok: true, newUser});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.use(auth);
// protected API (only authenticated users can access)
router.get('/getProfile/:username', async (req, res) => {
	const username = req.params.username;
	if (!username) {
		res.status(400).json({ error: 'Username is required' });
		return;
	}

	try {
		const userProfile = await User.getProfileByUsername(username, req.auth?.id);
		if (userProfile)
			res.status(200).json({userProfile});
		else
			res.status(404).json({ error: 'User not found' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/', async (req, res) => {
    const authUserId = req.auth.id;

    if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const user = await User.getById(authUserId);
        if (user)
            res.status(200).json(user);
        else
            res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/', async (req, res) => {
    const userId = req.body.id;
    const { id: authUserId, role: authUserRole } = req.auth;

    if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
    }

    if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    if (authUserId !== userId && authUserRole !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    try {
        const user = await User.delete(userId);
        if (user)
            res.status(200).json({ message: 'User deleted', user });
        else
            res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/', async (req, res) => {
    const authUserId = req.auth.id;
    const { id, username, displayname, email, password, profile_picture } = req.body;

    if (!id)
        return res.status(400).json({ error: 'User ID is required' });
    else if (!username && !displayname && !email && !password && !profile_picture) {
        return res.status(400).json({ error: 'At least one field is required' });
    }

    if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const user = await User.update(id, req.body);
        if (user)
            res.status(200).json(user);
        else
            res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;