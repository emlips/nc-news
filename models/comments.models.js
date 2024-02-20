const db = require("../db/connection");

exports.selectCommentsByArticleId = (id) => {
    return db
      .query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC`,
        [id]
      )
      .then((result) => {
        return result.rows;
      });
  };
  
  exports.insertCommentByArticleId = (id, username, body) => {
    return db
      .query(
        `INSERT INTO comments 
      (body, article_id, author)
      VALUES
      ($1, $2, $3) RETURNING *`,
        [body, id, username]
      )
      .then(({ rows }) => {
        return rows[0].body;
      });
  };