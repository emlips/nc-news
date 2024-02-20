const { selectArticleById } = require("../models/articles.models");
const {
  selectCommentsByArticleId,
  insertCommentByArticleId,
} = require("../models/comments.models");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([selectCommentsByArticleId(article_id), selectArticleById(article_id)])
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
