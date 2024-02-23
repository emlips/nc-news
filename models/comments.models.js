const db = require("../db/connection");

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

exports.updateCommentByCommentId = (id, voteChange) => {
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
      [voteChange, id]
    )
    .then(({ rows }) => {
      if (!rows[0]) {
        return Promise.reject({
          status: 404,
          msg: "comment does not exist",
        });
      }
      return rows[0];
    });
};
