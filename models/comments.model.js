const db = require(`${__dirname}/../db/connection`)

exports.selectCommentsByArticleId = (article_id) => {
    return db.query(`
        SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`, [article_id])
        .then((databaseQuery) => {
            return databaseQuery.rows;
        })
}

exports.insertComment = (body, username, article_id) => {
    return db.query(`
        INSERT INTO comments
        (body, article_id, author)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [body, article_id, username])
        .then((databaseInsert) => {
            return databaseInsert.rows[0];
        })
}

exports.deleteComment = (comment_id) => {
    return db.query(`
        DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *`, [comment_id])
        .then((deleteAttemtp) => {
            if (deleteAttemtp.rowCount === 0) {
                return Promise.reject({status: 404, msg: "ERROR: comment does not exist"})
            }
        })
}
