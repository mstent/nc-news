const articlesRouter = require("express").Router();
const {
    getArticleById,
    getArticles,
    patchArticleVotes,
} = require(`${__dirname}/../controllers/articles.controllers`);

const {
    getCommentsByArticleId,
    postComment,
} = require(`${__dirname}/../controllers/comments.controllers`);

articlesRouter.get("/", getArticles);
articlesRouter
    .route("/:article_id")
    .get(getArticleById)
    .patch(patchArticleVotes);
articlesRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postComment);

module.exports = articlesRouter;
