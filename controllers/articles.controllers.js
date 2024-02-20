const {
  selectArticleById,
  selectArticles,
  updateArticleById,
} = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  const { topic } = req.query;
  selectArticles(topic)
    .then((articles) => {
      res.status(200).send({ articles });
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
  selectArticleById(article_id)
    .then(({ votes }) => {
      return updateArticleById(article_id, inc_votes, votes);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
