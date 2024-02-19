const express = require("express");
const {
  getTopics,
  getEndpoints,
  getArticleById,
} = require("./controllers/news.controllers");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
  next();
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "bad request" });
  }
  next(err);
});

module.exports = app;
