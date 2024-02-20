const db = require("../db/connection");

exports.selectArticles = (topic) => {
  const queryValues = [];
  let articlesQuery = `SELECT * FROM articles`;

  if (topic) {
    articlesQuery += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  articlesQuery += ` ORDER BY created_at DESC`;

  const articles = db.query(articlesQuery, queryValues);
  const commentCounts = db.query(
    `SELECT article_id, COUNT(comment_id) FROM comments GROUP BY article_id`
  );
  const topicCheck = db.query(`SELECT slug FROM topics WHERE slug = $1`, [
    topic,
  ]);

  return Promise.all([articles, commentCounts, topicCheck]).then(
    ([articles, commentCounts, topics]) => {
      if (topic) {
        if (!topics.rows[0]) {
          return Promise.reject({
            status: 404,
            msg: "topic not found",
          });
        }
      }

      const commentRef = {};
      for (const row of commentCounts.rows) {
        commentRef[row.article_id] = Number(row.count);
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
  const commentCount = db.query(
    `SELECT COUNT(comment_id) FROM comments WHERE article_id = $1`,
    [id]
  );
  return Promise.all([article, commentCount]).then(
    ([articleResult, commentCountResult]) => {
      if (!articleResult.rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "article does not exist",
        });
      }
      const article = articleResult.rows[0];
      article.comment_count = Number(commentCountResult.rows[0].count);
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
