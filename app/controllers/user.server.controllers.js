const Joi = require('joi');
const users = require('../models/user.server.models');

const create_account = (req, res) => {
    const user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password
    };

    users.addNewUser(user, (err, id) => {
        if (err) {
            console.error("SQL Error:", err.message);
            return res.status(400).send("Error creating user");
        }
        res.status(201).send({ user_id: id });
    });
};

const login = (req, res) => {
    
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    users.authenticateUser(email, password, (err, user_id) => {
    if (err) {
        console.error("AUTH ERROR:", err);
        return res.status(500).send("Authentication error");
    }


        // Check if token already exists
        users.getToken(user_id, (err, token) => {
            if (err) return res.status(500).send("Error checking token");

            if (token) {
                // already logged in
                return res.status(200).send({ session_token: token });
            }

            // Create a new token if deosnt exist
            users.setToken(user_id, (err, newToken) => {
                if (err) return res.status(500).send("Error setting token");
                return res.status(200).send({ session_token: newToken });
            });
        });
    });
};



const logout = (req, res) => {

    const token = req.get('X-Authorization');

    if (!token) {
        return res.status(401).send("No session token provided");
    }

    users.removeToken(token, (err) => {
    if (err) {
        console.error("LOGOUT ERROR:", err);
        return res.status(500).send("Error logging out");
    }

    console.log("Logout success for token:", token);
    return res.sendStatus(200);
    });


};

module.exports = {
    create_account: create_account,
    login: login,
    logout: logout
};


