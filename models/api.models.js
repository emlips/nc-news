const db = require("../db/connection");
const endpointsData = require("../endpoints.json");

exports.selectEndpoints = () => {
  return endpointsData;
};