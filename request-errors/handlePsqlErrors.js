function psqlErrors(err, req, res, next) {
    if (err.code === "23503") {
        res.status(404).send({ msg: "ERROR: article does not exist" });
    }
    if (err.code === "22P02") {
        res.status(400).send({ msg: "ERROR: bad request" });
    }
    if (err.code === "23502") {
        res.status(400).send({ msg: "ERROR: bad request" });
    }
    next(err);
}

module.exports = psqlErrors