const { selectEndpoints } = require("../models/endpoints.models");

exports.getEndpoints = (req, res, next) => {
  Promise.all([selectEndpoints()]).then((result) => {
    const endpoints = result[0];
    res.status(200).send({ endpoints });
  });
};
