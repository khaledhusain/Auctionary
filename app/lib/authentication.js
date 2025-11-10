const users = require('../models/user.server.models');

//Middleware
const authenticate = (req, res, next) => {
    const token = req.get('X-Authorization');

    if (!token) {
        return res.status(401).send("No session token provided");
    }

    users.getIDFromToken(token, (err, id) => {
        if (err || !id) {
            return res.status(401).send("Invalid or expired session token");
        }

        //Token is valid
        req.authenticatedUserID = id; // store user id for later use
        next(); 
    });
};

module.exports = authenticate;
