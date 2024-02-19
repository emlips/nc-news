const { selectTopics, selectEndpoints } = require("../models/news.models");

exports.getEndpoints = (req, res, next) => {
  Promise.all([selectEndpoints()]).then((result) => {
    const endpoints = result[0];
    res.status(200).send({ endpoints });
  });
};

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};
