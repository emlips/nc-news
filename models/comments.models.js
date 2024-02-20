const db = require("../db/connection");

exports.selectCommentsByArticleId = (id) => {
  return db
    .query(
      `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at ASC`,
      [id]
    )
    .then(({ rows }) => {
      return rows;
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

exports.removeCommentById = (id) => {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1`, [id])
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "comment not found",
        });
      }
      return db.query(`DELETE FROM comments WHERE comment_id = $1`, [id]);
    });
};
