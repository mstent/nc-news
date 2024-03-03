const db = require(`${__dirname}/../db/connection`)

exports.selectUsers = () => {
    return db.query(`SELECT * FROM users`)
    .then((databaseQuery) => {
        return databaseQuery.rows;
    })
}

exports.selectUserByUsername = (username) => {
    return db.query('SELECT * FROM users WHERE username = $1', [username]).then ((databaseQuery) => {
        if (databaseQuery.rows.length === 0) {
            return Promise.reject({status: 404, msg: "ERROR: username does not exist"})
        }
        return databaseQuery.rows[0];
    })
}