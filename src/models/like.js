const db = require('./db');

class Like {
	static async create(userId, postId) {
		return new Promise((resolve, reject) => {
			const query = `INSERT INTO likes (user_id, post_id) VALUES (?, ?)`;
			db.execute(query, [userId, postId], (err, rows) => {
				if (err) return reject(err);
				else {
					resolve(rows.affectedRows !== 0)
				}
			});
		});
	}

	static async delete(userId, postId) {
		return new Promise((resolve, reject) => {
			const query = `DELETE FROM likes WHERE user_id = ? AND post_id = ?`;
			db.execute(query, [userId, postId], (err, rows) => {
				if (err) return reject(err);
				else {
					resolve(rows.affectedRows !== 0)
				}
			});
		});
	}

	static async getByPostId(postId) {
		return new Promise((resolve, reject) => {
			const query = `SELECT COUNT(*) AS count FROM likes WHERE post_id = ?`;
			db.execute(query, [postId], (err, rows) => {
				if (err) return reject(err);
				else {
					if (rows.length === 0) resolve(null);
					else resolve(rows[0].count);
				}
			});
		});
	}

	static async getIsLiked(postId, userId) {
		return new Promise((resolve, reject) => {
			const query = `SELECT post_id FROM likes WHERE user_id = ? AND post_id = ?`;
			db.execute(query, [userId, postId], (err, rows) => {
				if (err) return reject(err);
				else {
					if (rows.length === 0) resolve(false);
					else resolve(true);
				}
			});
		});
	}
}

module.exports = Like;