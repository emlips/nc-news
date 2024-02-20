const db = require("../db/connection");

exports.selectArticles = () => {
  const articles = db.query("SELECT * FROM articles ORDER BY created_at DESC");
  const commentCounts = db.query(
    `SELECT article_id, COUNT(comment_id) FROM comments GROUP BY article_id`
  );
  return Promise.all([articles, commentCounts]).then(
    ([articles, commentCounts]) => {
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
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [id])
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