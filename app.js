const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/news.controllers");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
  next();
});

module.exports = app;
