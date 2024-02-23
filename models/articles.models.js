const db = require("../db/connection");

exports.selectArticles = (topic, sort_by = "created_at", order = "desc") => {
  const queryValues = [];
  let articlesQuery = `SELECT articles.*, COUNT(comments.article_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id`;
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

  articlesQuery += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;

  const articles = db.query(articlesQuery, queryValues);
  const topicCheck = db.query(`SELECT slug FROM topics WHERE slug = $1`, [
    topic,
  ]);

  return Promise.all([articles, topicCheck]).then(([articles, topics]) => {
    if (topic) {
      if (!topics.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "topic not found",
        });
      }
    }
    return articles.rows;
  });
};

exports.selectArticleById = (id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comments.article_id)::INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
      [id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "article does not exist",
        });
      }
      return rows[0];
    });
};

exports.updateArticleById = (id, voteChange) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [voteChange, id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "article does not exist",
        });
      }
      return rows[0];
    });
};

exports.insertArticle = (
  author,
  title,
  body,
  topic,
  article_img_url = "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
) => {
  return db
    .query(
      `INSERT INTO articles
  (author, title, body, topic, article_img_url)
  VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [author, title, body, topic, article_img_url]
    )
    .then(({ rows }) => {
      const article = rows[0];
      article.comment_count = 0;
      return article;
    });
};
