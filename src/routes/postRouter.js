const auth = require('../middlewares/auth');
const Post = require('../models/post');
const PostMedia = require('../models/postMedia');
const User = require('../models/user');
const router = require('express').Router();

// public API
router.get('/getPost/:id', async (req, res) => {
    const { id } = req.params;
    const user_id = req?.auth?.id;

    try {
        const post = await Post.getById(id, { withLiked: !!user_id, authUserId: user_id });
        if (post)
            res.status(200).json(post);
        else
            res.status(404).json({ error: 'Post not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/getPosts', async (req, res) => {
	const user_id = req?.auth?.id;

    try {
		const posts = await Post.getAll({ withLiked: !!user_id, authUserId: user_id });
        res.status(200).json({ posts: posts ?? [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/searchPosts/:search', async (req, res) => {
	const searchTerm = req.params.search;

	try {
		const posts = await Post.searchPosts(searchTerm);
		res.status(200).json({ posts: posts ?? [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/getPosts/:username', async (req, res) => {
	const { username } = req.params;
	const user_id = req?.auth?.id;

    try {
        const posts = await Post.getPostsByUsername(username, { withLiked: !!user_id, authUserId: user_id });
        res.status(200).json({ posts: posts ?? [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.use(auth);
// protected API (only authenticated users can access)

router.post('/', async (req, res) => {
    const { content, mediaUrls } = req.body;

	if (!content && !mediaUrls) {
		res.status(400).json({ error: 'Content or mediaUrls is required' });
		return;
	}

    const { id: user_id } = req.auth;
	if (!user_id) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

    const user = await User.getById(user_id);
	if (!user) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

    try {
        const post = await Post.create({ content, mediaUrls, user_id });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/getFeed', async (req, res) => {
	const authUser = req.auth;

	if (!authUser) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	const user = await User.getById(authUser.id);
	if (!user) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
        const posts = await Post.getFeed({ authUserId: authUser.id });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/', async (req, res) => {
	const { postId, description } = req.body;

	if (!postId || !description) {
		res.status(400).json({ error: 'Post id and description are required' });
		return;
	}

	const postCheck = await Post.getById(postId, {});
	if (!postCheck) {
		res.status(404).json({ error: 'Post not found' });
		return;
	}

	const { username } = req.auth;
	if (!username || username !== postCheck.user.username) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		const updated = await Post.update(postId, { description });
		res.status(200).json({ post: updated });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.delete('/:postId', async (req, res) => {
	const { postId } = req.params;

	if (!postId) {
		res.status(400).json({ error: 'Post id is required' });
		return;
	}

	const postCheck = await Post.getById(postId, {});
	if (!postCheck) {
		res.status(404).json({ error: 'Post not found' });
		return;
	}

	const { username } = req.auth;
	if (!username || username !== postCheck.user.username) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}

	try {
		await PostMedia.deleteByPostId(postId);
		await Post.delete(postId);
		res.status(200).json({ deleted: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});


module.exports = router;