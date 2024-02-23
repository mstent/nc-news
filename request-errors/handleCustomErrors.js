function customErrors(err, req, res, next) {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    }
    next(err);
}

module.exports = customErrors