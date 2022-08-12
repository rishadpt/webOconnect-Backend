const jwt = require('jsonwebtoken')

module.exports = {
    //auth verifer middleware
    verifyToken: (req, res, next) => {

        let authHeader = req.headers.authorization
        if (authHeader === undefined) {
            res.status(401).send({ status: "FAILED", message: 'User not Authorized' })
        }

        let token = authHeader.split(" ")[1]

        jwt.verify(token, process.env.JWT_SECRET_KEY, function (err) {
            if (err) {
                res.status(500).send({ error: "authentication failed" })
            } else {
                next()
            }
        })
    }

} 