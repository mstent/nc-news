const apiRouter = require("express").Router();
const topicsRouter = require(`${__dirname}/topics-router`);
const usersRouter = require(`${__dirname}/users-router`);
const commentsRouter = require(`${__dirname}/comments-router`);
const articlesRouter = require(`${__dirname}/articles-router`)

const {
    getEndpoints,
} = require(`${__dirname}/../controllers/endpoints.controller`);

apiRouter.get("/", getEndpoints);
apiRouter.use("/articles", articlesRouter)
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
