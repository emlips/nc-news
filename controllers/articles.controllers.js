const {
  selectArticleById,
  selectArticles,
  updateArticleById,
  insertArticle,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  removeArticleById,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  selectArticles(topic, sort_by, order, limit, p)
    .then((articles) => {
      res.status(200).send({ articles, total_count: articles.length });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticleById(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then(() => {
      return removeArticleById(article_id);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  Promise.all([
    selectCommentsByArticleId(article_id, limit, p),
    selectArticleById(article_id),
  ])
    .then((promiseResults) => {
      res.status(200).send({ comments: promiseResults[0] });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  insertCommentByArticleId(article_id, username, body)
    .then((newComment) => {
      res.status(201).send({ newComment });
    })
    .catch(next);
};
