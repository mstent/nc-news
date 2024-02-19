const { readEndpoints } = require("../models/endpoints.model")


exports.getEndpoints = (req, res, next) => {
    readEndpoints().then((endpoints) => {
        res.status(200).send({endpoints})
    })
}