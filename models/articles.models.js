const db = require("../db/connection");
const { createCommentRef } = require("../utils");

exports.selectArticles = (topic, sort_by = "created_at", order = "desc") => {
  const queryValues = [];
  let articlesQuery = `SELECT * FROM articles`;
  const validSortBy = ["article_id", "title", "author", "created_at", "votes"];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "bad request",
    });
  }

  if (topic) {
    articlesQuery += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  articlesQuery += ` ORDER BY ${sort_by} ${order}`;

  const articles = db.query(articlesQuery, queryValues);
  const topicCheck = db.query(`SELECT slug FROM topics WHERE slug = $1`, [
    topic,
  ]);

  return Promise.all([articles, createCommentRef(), topicCheck]).then(
    ([articles, commentRef, topics]) => {
      if (topic) {
        if (!topics.rows[0]) {
          return Promise.reject({
            status: 404,
            msg: "topic not found",
          });
        }
      }

      articles.rows.forEach((article) => {
        delete article.body;
        if (!commentRef[article.article_id]) {
          article.comment_count = 0;
        } else {
          article.comment_count = commentRef[article.article_id];
        }
      });

      return articles.rows;
    }
  );
};

exports.selectArticleById = (id) => {
  const article = db.query(`SELECT * FROM articles WHERE article_id = $1`, [
    id,
  ]);
  return Promise.all([article, createCommentRef()]).then(
    ([{ rows }, commentRef]) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "article does not exist",
        });
      }
      const article = rows[0];
      article.comment_count = Number(commentRef[article.article_id]);
      return article;
    }
  );
};

exports.updateArticleById = (id, votesUpdate, votes) => {
  votes += votesUpdate;
  return db
    .query(`UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *`, [
      votes,
      id,
    ])
    .then(({ rows }) => {
      return rows[0];
    });
};
