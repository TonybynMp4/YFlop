const db = require('./db');
const PostMedia = require('./postMedia');
const Comment = require('./comment');
const Like = require('./like');

class Post {
	static async getData(post, { withMedia = true, withComments = true, withLikes = true, withLiked = false, authUserId = null } = {}) {
		if (!post) return null;

		return {
			id: post.id,
			content: post.description,
			images: withMedia && await PostMedia.getByPostId(post.id) || [],
			user: {
				username: post.username,
				displayname: post.displayname,
				profilePicture: post.profile_picture,
			},
			liked: (withLiked && authUserId) && await Like.getIsLiked(post.id, authUserId) || false,
			likes: withLikes && await Like.getByPostId(post.id) || 0,
			createdAt: post.created_at,
			comments: withComments && await Comment.getByPostId(post.id) || [],
		}
	}

	static async searchPosts(search, { authUserId = null }) {
		return new Promise((resolve, reject) => {
			const query = `SELECT post.*, user.username, user.displayname, user.profile_picture
				FROM posts AS post
				LEFT JOIN users AS user
				ON post.user_id = user.id
				WHERE post.description LIKE :search OR user.username LIKE :search OR user.displayname LIKE :search
				ORDER BY post.created_at DESC
			`;

			db.query(query, { search: `%${search}%` }, async (err, rows) => {
				if (err) {
					return reject(err);
				}
				try {
					const posts = [];
					for (let row of rows) {
						const postData = await this.getData(row, { withMedia: true, withComments: true, withLikes: true, withLiked: true, authUserId });
						posts.push(postData);
					}
					resolve(posts);
				} catch (error) {
					reject(error);
				}
			});
		});
	}

    static async getAll({ withMedia = true, withComments = true, withLikes = true, withLiked = false, authUserId = null }) {
		return new Promise((resolve, reject) => {
			const query = `SELECT post.*, user.username, user.displayname, user.profile_picture
				FROM posts AS post
				LEFT JOIN users AS user
				ON post.user_id = user.id
				ORDER BY post.created_at DESC
			`;
            db.query(query, async (err, rows) => {
                if (err) {
                    return reject(err);
                }

                try {
					const posts = [];
                    for (let row of rows) {
						const postData = await this.getData(row, { withMedia, withComments, withLikes, withLiked, authUserId });
						posts.push(postData);
					}

                    resolve(posts);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

	static async getFeed({ withMedia = true, withComments = true, withLikes = true, withLiked = true, authUserId }) {
		if (!authUserId) {
			throw new Error('authUserId is required');
		}

		const query = `
			SELECT post.*, user.username, user.displayname, user.profile_picture
			FROM posts AS post
			LEFT JOIN users AS user
			ON post.user_id = user.id
			WHERE post.user_id IN (
				SELECT following_id FROM followers WHERE follower_id = ?
			)
			OR post.user_id = ?
			ORDER BY post.created_at DESC
		`;

		return new Promise((resolve, reject) => {
			db.query(query, [authUserId, authUserId], async (err, rows) => {
                if (err) {
                    return reject(err);
                }

                try {
					const posts = [];
                    for (let row of rows) {
						const postData = await this.getData(row, { withMedia, withComments, withLikes, withLiked, authUserId });
						posts.push(postData);
                    }

                    resolve(posts);
                } catch (error) {
                    reject(error);
                }
            });
		});
	}

    static async getById(id, { withMedia = true, withComments = true, withLikes = true, withLiked = false, authUserId = null }) {
        return new Promise((resolve, reject) => {
			const query = `SELECT post.*, user.username, user.displayname, user.profile_picture
				FROM posts AS post
				LEFT JOIN users AS user
				ON post.user_id = user.id WHERE post.id = ?
			`;

            db.execute(query, [id], async (err, rows) => {
                if (err)
                    reject(err);
                else
                    try {
                        if (rows.length === 0) return resolve(null);
                        const post = await this.getData(rows[0], { withMedia, withComments, withLikes, withLiked, authUserId });

						resolve(post);
                    } catch (error) {
                        reject(error);
                    }
            });
        });
    }

	static async getPostsByUsername(username, { withMedia = true, withComments = true, withLikes = true, withLiked = false, authUserId = null }) {
		return new Promise((resolve, reject) => {
			const query = `SELECT post.*, user.username, user.displayname, user.profile_picture
				FROM posts AS post
				LEFT JOIN users AS user
				ON post.user_id = user.id
				WHERE user.username = ?
				ORDER BY post.created_at DESC
			`;

			db.execute(query, [username], async (err, rows) => {
				if (err)
					reject(err);
				else
					try {
						if (rows.length === 0) return resolve(null);
						const posts = [];

						for (let row of rows) {
							const postData = await this.getData(row, { withMedia, withComments, withLikes, withLiked, authUserId });
							posts.push(postData);
						}

						resolve(posts);
					} catch (error) {
						reject(error);
					}
			});
		});
	}

    static async create({ content, mediaUrls, user_id }) {
        return new Promise((resolve, reject) => {
            db.execute('INSERT INTO posts (user_id, description) VALUES (?, ?)', [user_id, content], async (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows.affectedRows === 0)
                        reject(new Error('post not created'));
                    else {
						if (mediaUrls && mediaUrls.length > 0) {
							const medias = await PostMedia.create({ mediaUrls, user_id, postId: rows.insertId });
							if (!medias) {
								await this.delete(rows.insertId);
								reject(new Error('post medias not created'));
							}
						}

						const post = await this.getById(rows.insertId, {});
						resolve(post);
					}
                }
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.execute('DELETE FROM posts WHERE id = ?', [id], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows.affectedRows === 0)
                        reject(new Error('post not found'));
                    else
                        resolve(true);
                }
            });
        });
    }

    static async update(id, { description }) {
        if (!description) {
            throw new Error('At least one field is required');
        }

        return new Promise((resolve, reject) => {
            let query = 'UPDATE posts SET ';
            let fields = [];
            let values = [];
            if (description) {
                fields.push('description = ?');
                values.push(description);
            }
            query += fields.join(', ') + ' WHERE id = ?';
            db.execute(query, [...values, id], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows.affectedRows === 0)
                        reject(new Error('post not found'));
                    else
                        resolve(this.getById(id, {}));
                }
            });
        });
    }
}

module.exports = Post;