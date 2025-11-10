const crypto = require('crypto');
const db = require('../../database'); 


const getHash = function (password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

const addNewUser = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)';
    const values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];

    db.run(sql, values, function (err) {
        if (err) return done(err);
        return done(null, this.lastID); // returns new user ID
    });
};

const authenticateUser = (email, password, done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email=?';

    db.get(sql, [email], (err, row) => {
        if (err) return done(err);
        if (!row) return done(404); // wrong email

        if (row.salt === null) row.salt = '';
        const salt = Buffer.from(row.salt, 'hex');

        if (row.password === getHash(password, salt)) {
            return done(false, row.user_id);
        } else {
            return done(404); // wrong password
        }
    });
};

const getToken = (id, done) => {
    const sql = 'SELECT session_token FROM users WHERE user_id = ?';

    db.get(sql, [id], (err, row) => {
        if (err) return done(err);

        if (!row || !row.session_token) {
            return done(false, null); // no token yet
        } else {
            return done(false, row.session_token); // return existing token
        }
    });
};

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');

    const sql = 'UPDATE users SET session_token=? WHERE user_id=?';

    db.run(sql, [token, id], (err) => {
        return done(err, token);
    });
};

const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';

    db.run(sql, [token], (err) => {
        return done(err);
    });
};

const getIDFromToken = (token, done) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?';

    db.get(sql, [token], (err, row) => {
        if (err) return done(err);
        if (!row) return done(401); // invalid or expired token
        return done(false, row.user_id);
    });
};

module.exports = {
    addNewUser,
    authenticateUser,
    getToken,
    setToken,
    removeToken,
    getIDFromToken
};



