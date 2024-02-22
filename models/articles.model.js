const db = require(`${__dirname}/../db/connection`);

exports.selectArticleById = (article_id) => {
    return db
        .query(
            `SELECT
            articles.article_id,
            articles.author,
            articles.title,
            articles.body,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            CAST(COUNT(comments.comment_id)AS int) AS comment_count
        FROM
            articles
        LEFT JOIN
            comments
        ON
            articles.article_id = comments.article_id
        WHERE
            articles.article_id = $1
        GROUP BY
            articles.article_id,
            articles.author,
            articles.title,
            articles.body,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url
            `,
            [article_id]
        )
        .then((databaseQuery) => {
            if (databaseQuery.rows.length === 0) {
                return Promise.reject({
                    status: 404,
                    msg: `ERROR: article does not exist`,
                });
            }
            return databaseQuery.rows[0];
        });
};

exports.selectArticles = (topic = "", sort_by = "created_at", order = 'DESC') => {
    const columns = [
        "author",
        "title",
        "topic",
        "created_at",
        "votes",
        "article_img_url",
        "comment_count",
    ];
    if (!columns.includes(sort_by)) {
        return Promise.reject({
            status: 400,
            msg: "ERROR: invalid sort query",
        });
    }
    if (columns.slice(0, -1).includes(sort_by)) {
        sort_by = `articles.${sort_by}`;
    }

    if (!['ASC', 'DESC'].includes(order.toUpperCase())) {
        return Promise.reject({status: 400, msg: 'ERROR: invalid order query'})
    }

    let dbQuery = `SELECT
        articles.author,
        articles.title,
        articles.article_id,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.article_img_url,
        CAST(COUNT(comments.comment_id)AS int) AS comment_count
    FROM
        articles
    LEFT JOIN
        comments
    ON
        articles.article_id = comments.article_id`;

    if (topic) {
        dbQuery += ` WHERE topic = '${topic}' `;
    }

    dbQuery += `
        GROUP BY
            articles.author,
            articles.title,
            articles.article_id,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url
        ORDER BY ${sort_by} ${order}`;
    return db.query(dbQuery).then((databaseQuery) => {
        return databaseQuery.rows;
    });
};

exports.updateArticleVotes = (article_id, inc_votes) => {
    return db
        .query(
            `
        UPDATE articles
        SET votes = votes+$1
        WHERE article_id = $2
        RETURNING *`,
            [inc_votes, article_id]
        )
        .then(() => {
            return this.selectArticleById(article_id);
        });
};
