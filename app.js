const express = require("express");
const { getEndpoints } = require("./controllers/endpoints.controllers");
const { getTopics } = require("./controllers/topics.controllers");
const {
  getArticleById,
  getArticles,
  patchArticleById,
} = require("./controllers/articles.controllers");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  deleteCommentById,
} = require("./controllers/comments.controllers");
const { getUsers } = require("./controllers/users.controllers");
const {
  handleInvalidEndpoint,
  handleCustomErrors,
  handlePSQLErrors,
} = require("./controllers/errors.controllers");

const app = express();
app.use(express.json());

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/users", getUsers);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get("/*", handleInvalidEndpoint);

app.use(handleCustomErrors);

app.use(handlePSQLErrors);

module.exports = app;
