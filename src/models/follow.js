const db = require('./db');

class Follow {
	static async getFollowerCount(userId) {
		return new Promise((resolve, reject) => {
			db.execute('SELECT COUNT(*) AS count FROM followers WHERE following_id = ?', [userId], (err, rows) => {
				if (err) return reject(err);
				resolve(rows[0].count);
			});
		});
	}

	static async getFollowingCount(userId) {
		return new Promise((resolve, reject) => {
			db.execute('SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?', [userId], (err, rows) => {
				if (err) return reject(err);
				resolve(rows[0].count);
			});
		});
	}

	static async follow(followerId, followingId) {
		return new Promise((resolve, reject) => {
			db.execute('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)', [followerId, followingId], (err, result) => {
				if (err) return reject(err);
				resolve(result.affectedRows > 0);
			});
		});
	}

	static async unfollow(followerId, followingId) {
		return new Promise((resolve, reject) => {
			db.execute('DELETE FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId], (err, result) => {
				if (err) return reject(err);
				resolve(result.affectedRows > 0);
			});
		});
	}

	static async isFollowing(followerId, followingId) {
		return new Promise((resolve, reject) => {
			db.execute('SELECT * FROM followers WHERE follower_id = ? AND following_id = ?', [followerId, followingId], (err, rows) => {
				if (err) return reject(err);
				resolve(rows.length > 0);
			});
		});
	}
}

module.exports = Follow;