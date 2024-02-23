const express = require("express");
const app = express();
const { getTopics } = require(`${__dirname}/controllers/topics.controller`);
const {
    getEndpoints,
} = require(`${__dirname}/controllers/endpoints.controller`);
const {
    getArticleById,
    getArticles,
    patchArticleVotes,
} = require(`${__dirname}/controllers/articles.controllers`);
const {
    getCommentsByArticleId,
    postComment,
    deleteCommentByCommentId,
} = require(`${__dirname}/controllers/comments.controllers`);
const { getUsers } = require(`${__dirname}/controllers/users.controllers`);

const { customErrors, psqlErrors } = require(`./request-errors`);

app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postComment);
app.patch("/api/articles/:article_id", patchArticleVotes);
app.delete("/api/comments/:comment_id", deleteCommentByCommentId);
app.get("/api/users", getUsers);

app.use(psqlErrors);
app.use(customErrors);

module.exports = app;
