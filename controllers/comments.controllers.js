const {
    selectCommentsByArticleId,
    insertComment,
} = require(`${__dirname}/../models/comments.model`);
const { selectArticleById } = require(`${__dirname}/../models/articles.model`);

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;
    const promises = [
        selectCommentsByArticleId(article_id),
        selectArticleById(article_id),
    ];

    Promise.all(promises)
        .then((data) => {
            res.status(200).send({ comments: data[0] });
        })
        .catch(next);
};

exports.postComment = (req, res, next) => {
    const { article_id } = req.params;
    const { body, username } = req.body;

    const promises = [
        insertComment(body, username, article_id),
        selectArticleById(article_id),
    ];

    Promise.all(promises)
        .then((data) => {
            res.status(201).send({ comment: data[0] });
        })
        .catch(next);
};
