exports.handleInvalidEndpoint = (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
  next();
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};

exports.handlePSQLErrors = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502" || err.code === "23503") {
    res.status(400).send({ msg: "bad request" });
  }
  next(err);
};

exports.handleServerErrprs = (err, req, res, next) => {
  res.status(500).send({ msg: "internal server error" });
};
