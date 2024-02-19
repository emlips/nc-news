const express = require("express");
const { getTopics } = require("./controllers/news.controllers");

const app = express();

app.get("/api/topics", getTopics);

app.get("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
  next();
});

module.exports = app;
