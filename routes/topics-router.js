const topicsRouter = require("express").Router();
const {getTopics} = require(`${__dirname}/../controllers/topics.controller`);

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
