const db = require(`${__dirname}/../db/connection`)

exports.selectArticleById = (article_id) => {
    return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((databaseQuery) => {
        if (databaseQuery.rows.length === 0) {
            return Promise.reject({status: 404, msg: `ERROR: article *${article_id}* does not exist`})
        }
        return databaseQuery.rows[0];
    })
}