const db = require('./db');

class PostMedia {
    static async getAll() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * from post_medias ORDER BY created_at DESC', async (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

	static async getByPostId(postId) {
		return new Promise((resolve, reject) => {
			db.execute(`SELECT media_url FROM post_medias WHERE post_id = ?`, [postId], (err, data) => {
				if (err) reject(err);
				else resolve(data.map(row => row.media_url));
			});
		});
	}

    static async getById(id) {
		const idType = typeof id;
		if (idType !== 'number' && idType !== 'string' && idType !== 'object') {
			throw new Error('id must be a number, string or array');
		}

		if (idType === 'object' && !Array.isArray(id)) {
			throw new Error('id must be an array');
		}

		const query = `
			SELECT * from post_medias WHERE
			${idType === 'object' ? 'id IN (?)' : 'id = ?'}
		`

        return new Promise((resolve, reject) => {
            db.execute(query, [id], (err, rows) => {
                if (err)
                    reject(err);
                else
					resolve(rows[0]);
            });
        });
    }

	// mediaUrls is an array of strings (URLs)
	// postId is a number
    static async create({ mediaUrls, user_id, postId }) {
		if (!mediaUrls || !postId || !user_id) {
			throw new Error('mediaUrls, user_id, and postId are required');
		}

		if (!Array.isArray(mediaUrls)) {
			throw new Error('mediaUrls must be an array');
		}

		if (mediaUrls.length === 0) {
			throw new Error('mediaUrls cannot be empty');
		}

		const query = 'INSERT INTO post_medias (media_url, user_id, post_id) VALUES ?';
		const values = mediaUrls.map(url => [url, user_id, postId]);

		return new Promise((resolve, reject) => {
			db.query(query, [values], (err, result) => {
				if (err) {
					reject(err);
				} else {
					resolve(result.insertId);
				}
			});
		});
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.execute('DELETE FROM post_medias WHERE id = ?', [id], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows.affectedRows === 0)
                        reject(new Error('post media not found'));
                    else
                        resolve(true);
                }
            });
        });
    }

	static async deleteByPostId(postId) {
		return new Promise((resolve, reject) => {
			db.execute('DELETE FROM post_medias WHERE post_id = ?', [postId], (err, rows) => {
				if (err)
					reject(err);
				else {
					resolve(true);
				}
			});
		});
	}

    static async update(id, { media_url }) {
		if (!media_url) {
            throw new Error('At least one field is required');
        }

        return new Promise((resolve, reject) => {
            let query = 'UPDATE posts SET ';
            let fields = [];
            let values = [];

			if (media_url) {
				fields.push('media_url = ?');
				values.push(media_url);
			}

            query += fields.join(', ') + ' WHERE id = ?';
            db.execute(query, [...values, id], (err, rows) => {
                if (err)
                    reject(err);
                else {
                    if (rows.affectedRows === 0)
                        reject(new Error('post not found'));
                    else
                        db.execute('SELECT * FROM post_medias WHERE id = ?', [id], (err, rows) => {
                            if (err)
                                reject(err);
                            else
                                resolve(rows[0]);
                        });
                }
            });
        });
    }
}

module.exports = PostMedia;