const { inTopicList } = require("../models/topics.model");

const {
    selectArticleById,
    selectArticles,
    updateArticleVotes,
} = require(`${__dirname}/../models/articles.model`);

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};

exports.getArticles = (req, res, next) => {
    const { topic } = req.query;
    const promises = [
        inTopicList(topic),
        selectArticles(topic)
    ]
    Promise.all(promises)
        .then((returnedPromises) => {
            res.status(200).send({ articles: returnedPromises[1] });
        })
        .catch(next)
};

exports.patchArticleVotes = (req, res, next) => {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    const promises = [
        updateArticleVotes(article_id, inc_votes),
        selectArticleById(article_id),
    ];
    Promise.all(promises)
        .then((data) => {
            res.status(200).send({ article: data[0] });
        })
        .catch(next);
};
