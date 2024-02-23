const express = require("express");
const {
  handleInvalidEndpoint,
  handleCustomErrors,
  handlePSQLErrors,
} = require("./controllers/errors.controllers");
const apiRouter = require("./routes/api-router");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.get("/*", handleInvalidEndpoint);

app.use(handleCustomErrors);

app.use(handlePSQLErrors);

module.exports = app;
