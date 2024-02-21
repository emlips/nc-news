const db = require("./db/connection");

exports.createCommentRef = () => {
  return db
    .query(
      `SELECT articles.article_id, COUNT(comment_id) FROM comments 
      RIGHT JOIN articles ON comments.article_id = articles.article_id GROUP BY articles.article_id`
    )
    .then(({ rows }) => {
      const commentRef = {};
      for (const row of rows) {
        commentRef[row.article_id] = Number(row.count);
      }
      return commentRef;
    });
};
