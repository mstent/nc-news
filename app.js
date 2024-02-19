const express = require("express");
const app = express();
const { getTopics } = require(`${__dirname}/controllers/topics.controller`);
const { getEndpoints } = require(`${__dirname}/controllers/endpoints.controller`);
const {getArticleById, getArticles} = require(`${__dirname}/controllers/articles.controllers`)


app.use(express.json());

app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id", getArticleById)


app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg: 'ERROR: bad request'})
    }
    next(err)
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    }
    next();
});

module.exports = app;
