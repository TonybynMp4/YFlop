const db = require('./db');

class Comment {
	static async getAll() {
		return new Promise((resolve, reject) => {
			const query = `SELECT comment.*, user.username, user.displayname, user.profile_picture
				FROM comments AS comment
				LEFT JOIN users AS user ON comment.user_id = user.id
			`;
			db.query(query, async (err, rows) => {
				if (err) return reject(err);
				else resolve(rows);
			});
		});
	}

	static async getById(id) {
		return new Promise((resolve, reject) => {
			const query = `SELECT comment.*, user.username, user.displayname, user.profile_picture
				FROM comments AS comment
				LEFT JOIN users AS user ON comment.user_id = user.id
				WHERE comment.id = ?
			`;
			db.execute(query, [id], async (err, rows) => {
				if (err) return reject(err);
				else {
					if (rows.length === 0) {
						resolve(null);
					} else {
						const row = rows[0];
						const newRow = {
							user: {
								username: row.username,
								displayname: row.displayname,
								profilePicture: row.profile_picture,
							},
							comment: {
								id: row.id,
								postId: row.post_id,
								userId: row.user_id,
								content: row.comment,
								createdAt: row.created_at,
							}
						}
						resolve(newRow);
					}
				}
			});
		});
	}

	static async getByPostId(postId) {
		return new Promise((resolve, reject) => {
			const query = `SELECT comment.*, user.username, user.displayname, user.profile_picture
				FROM comments AS comment
				LEFT JOIN users AS user ON comment.user_id = user.id
				WHERE comment.post_id = ?
			`;
			db.execute(query, [postId], async (err, rows) => {
				if (err) return reject(err);
				else {
					if (rows.length === 0) resolve(null);

					const newRows = rows.map((row) => {
						return {
							user: {
								username: row.username,
								displayname: row.displayname,
								profilePicture: row.profile_picture,
							},
							comment: {
								id: row.id,
								postId: row.post_id,
								userId: row.user_id,
								content: row.comment,
								createdAt: row.created_at,
							}
						};
					}).sort((a, b) => {
						return new Date(b.comment.createdAt) - new Date(a.comment.createdAt);
					});

					resolve(newRows);
				}
			});
		});
	}

	static async create({ content, postId, user_id }) {
		return new Promise((resolve, reject) => {
			db.execute('INSERT INTO comments (comment, post_id, user_id) VALUES (?, ?, ?)', [content, postId, user_id], async (err, rows) => {
				if (err)
					reject(err);
				else
					resolve(await this.getById(rows.insertId));
			});
		});
	}

	static async delete(id) {
		return new Promise((resolve, reject) => {
			db.execute('DELETE FROM comments WHERE id = ?', [id], (err, rows) => {
				if (err)
					reject(err);
				else {
					resolve(rows.affectedRows !== 0);
				}
			});
		});
	}

	static async update(id, { content }) {
		if (!content) {
			throw new Error('At least one field is required');
		}

		return new Promise((resolve, reject) => {
			let query = 'UPDATE comments SET ';
			let fields = [];
			let values = [];

			if (content) {
				fields.push('comment = ?');
				values.push(content);
			}

			query += fields.join(', ') + ' WHERE id = ?';
			db.execute(query, [...values, id], async (err, rows) => {
				if (err)
					reject(err);
				else {
					if (rows.affectedRows === 0)
						reject(new Error('post not found'));
					else
						resolve(await this.getById(id));
				}
			});
		});
	}
}

module.exports = Comment;