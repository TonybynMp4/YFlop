const db = require('./db')
const bcrypt = require('bcrypt');
const Follow = require('./follow');

class User {
	static async searchUsers(searchInput) {
		if (!searchInput) {
			throw new Error('searchInput is required');
		}

		return new Promise((resolve, reject) => {
			const query = `
				SELECT id, username, displayname, profile_picture FROM users
				WHERE username LIKE ? OR displayname LIKE ?
			`;
			db.execute(query, [`%${searchInput}%`, `%${searchInput}%`], async (err, rows) => {
				if(err) return reject(err);
				if (rows.length === 0) return resolve([]);

				const users = rows.map(row => ({
					id: row.id,
					username: row.username,
					displayname: row.displayname,
					profile_picture: row.profile_picture,
				}));
				resolve(users);
			});
		});
	}

    static async getProfileByUsername(username, user_id) {
        if (!username) {
            throw new Error('username is required');
        }

		return new Promise((resolve, reject) => {
			db.execute('SELECT id, username, displayname, profile_picture, bio FROM users WHERE username = ?', [username], async (err, rows) => {
				if(err) return reject(err);
				if (rows.length === 0) return resolve(null);

				const followerCount = await Follow.getFollowerCount(rows[0].id);
				const followingCount = await Follow.getFollowingCount(rows[0].id);
				const user = {
					id: rows[0].id,
					username: rows[0].username,
					displayname: rows[0].displayname,
					profilePicture: rows[0].profile_picture,
					bio: rows[0].bio,
					followers: followerCount,
					following: followingCount,
					isFollowing: user_id ? rows[0].id !== user_id && await Follow.isFollowing(user_id, rows[0].id) : false,
				}
				resolve(user);
			});
		});
	}

	static async getById(id) {
        if (!id) {
            throw new Error('id is required');
        }

		return new Promise((resolve, reject) => {
			db.execute('SELECT id, username, displayname, profile_picture, role FROM users WHERE id = ?', [id], async (err, rows) => {
				if(err) return reject(err);
				if (rows.length === 0) return resolve(null);

				const user = {
					id: rows[0].id,
					username: rows[0].username,
					displayname: rows[0].displayname,
					email: rows[0].email,
					role: rows[0].role,
					profilePicture: rows[0].profile_picture,
				}
				resolve(user);
			});
		});
	}

    static async getByEmail(email) {
        if (!email) {
            throw new Error('Email is required');
        }

        return new Promise((resolve, reject) => {
            db.execute('SELECT id, username, displayname, email, password, role, profile_picture FROM users WHERE email = ?', [email], (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows[0]);
            });
        });
    }

	static async getByUsername(username) {
        if (!username) {
            throw new Error('Username is required');
        }

        return new Promise((resolve, reject) => {
            db.execute('SELECT id, username, displayname, email, password, role, profile_picture FROM users WHERE username = ?', [username], (err, rows) => {
                if(err)
                    reject(err);
                else
                    resolve(rows[0]);
            });
        });
    }

    static async create(username, displayname, email, password) {
        if (!username || !displayname || !email || !password) {
            throw new Error('All fields are required');
        }

        password = bcrypt.hashSync(password, 10);

        return new Promise((resolve, reject) => {
            db.execute('INSERT INTO users (username, displayname, email, password) VALUES (?, ?, ?, ?)', [username, displayname, email, password], (err, rows) => {
                if(err) return reject(err);

                if (rows.affectedRows === 0) return reject(new Error('user not created'));
                db.execute('SELECT id, username, displayname FROM users WHERE id = ?', [rows.insertId], (err, rows) => {
                    if(err) return reject(err);
                    resolve(rows[0]);
                });
            });
        });
    }

    static async update(id, { username, displayname, email, password, profile_picture }) {
        if (!id) {
            throw new Error('id is required');
        }

        if (!username && !displayname && !email && !password && !profile_picture) {
            throw new Error('At least one field is required');
        }

        return new Promise((resolve, reject) => {
            let query = 'UPDATE users SET ';
            let fields = [];
            let values = [];

            if (username) {
                fields.push('username = ?');
                values.push(username);
            }

            if (displayname) {
                fields.push('displayname = ?');
                values.push(displayname);
            }

            if (email) {
                fields.push('email = ?');
                values.push(email);
            }

            if (password) {
                password = bcrypt.hashSync(password, 10);
                fields.push('password = ?');
                values.push(password);
            }

			if (profile_picture) {
                fields.push('profile_picture = ?');
                values.push(profile_picture);
            }

            query += fields.join(', ') + ' WHERE id = ?';
            values.push(id);

            db.execute(query, values, (err, result) => {
                if(err)
                    return reject(err);

                if(result.affectedRows === 0) {
                    return reject(new Error('user not found'));
                }

                resolve(result);
            });
        });
    }

    static async delete(id) {
        if (!id) {
            throw new Error('id is required');
        }

        return new Promise((resolve, reject) => {
            db.execute('DELETE FROM users WHERE id = ?', [id], (err, rows) => {
                if(err)
                    reject(err);
                else {
                    if (rows.affectedRows === 0)
                        reject(new Error('user not found'));
                    else
                        resolve(rows);
                }
            });
        });
    }
}

module.exports = User;