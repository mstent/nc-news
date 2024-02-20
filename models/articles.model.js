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

exports.selectArticles = () => {
    return db.query(`
        SELECT
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(comments.comment_id) AS comment_count
        FROM
            articles
        LEFT JOIN
            comments
        ON
            articles.article_id = comments.article_id
        GROUP BY
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url
        ORDER BY articles.created_at DESC
    `)
    .then ((databaseQuery) => {
        return databaseQuery.rows;
    })
}

exports.updateArticleVotes = (article_id, inc_votes) => {
    return db.query(`
        UPDATE articles
        SET votes = votes+$1
        WHERE article_id = $2
        RETURNING *`,
        [inc_votes, article_id]
    )
    .then((databaseUpdate) => {
        return databaseUpdate.rows[0];
    })
}