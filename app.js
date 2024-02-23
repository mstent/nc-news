const express = require("express");
const app = express();

const { customErrors, psqlErrors } = require(`./request-errors`);
const apiRouter = require("./routes/api-router");

app.use(express.json());
app.use("/api", apiRouter);

app.use(psqlErrors);
app.use(customErrors);

module.exports = app;
