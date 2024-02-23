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

exports.selectArticles = (topic = "", sort_by = "created_at", order = 'DESC', limit = 10, p = 1) => {
    const columns = [
        "author",
        "article_id",
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
        ORDER BY ${sort_by} ${order}`
    return db.query(dbQuery).then((databaseQuery) => {
        return pageLimiter(limit, p,databaseQuery.rows)
    });
};

function pageLimiter(limit, p, articlesArray) {
    if (!(limit > 0) && limit !== 'null') {
        return Promise.reject({status:400, msg: "ERROR: invalid limit query"})
    }
    const total_count = articlesArray.length;
    
    if (total_count === 0) {
        return {articles: articlesArray, total_count: total_count}
    }
    
    const startIndex =  (p * limit) - (limit -1) -1;
    
    if (!(startIndex < total_count) && limit !== 'null') {
        return Promise.reject({status: 400, msg: "ERROR: invalid p query"})
    }

    if (limit >= total_count || limit === 'null') {
        return {articles: articlesArray, total_count: total_count}
    } else {
        return {articles: articlesArray.slice(startIndex ,Number(startIndex) + Number(limit)), total_count: total_count}
    }

}

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
