const db = require("../db/connection");
const endpointsData = require("../endpoints.json");

exports.selectEndpoints = () => {
  return endpointsData;
};

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};
