const Joi = require('joi');
const users = require('../models/user.server.models');

const create_account = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().trim().min(1).required(),
        last_name: Joi.string().trim().min(1).required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string()
            .min(6)
            .max(30)
            .pattern(/[0-9]/)           // at least one number
            .pattern(/[A-Z]/)           // at least one uppercase
            .pattern(/[a-z]/)           // at least one lowercase
            .pattern(/[^A-Za-z0-9]/)    // at least one special character
            .required()
    }).unknown(false);

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const user = {
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        password: value.password
    };

    users.addNewUser(user, (err, id) => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).send({ error_message: "Email already in use" });
            }
            console.error("SQL Error:", err.message);
            return res.status(500).send({ error_message: "Server error" });
        }
        return res.status(201).send({ user_id: id });
    });
};


const login = (req, res) => {
    
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const { email, password } = req.body;

    users.authenticateUser(email, password, (err, user_id) => {

    // Invalid email or password
    if (err === 404) {
        return res.status(400).send({
            error_message: "Invalid email or password"
        });
    }

    // Server error
    if (err) {
        console.error("AUTH ERROR:", err);
        return res.status(500).send("Authentication error");
    }



        // Check if token already exists
        users.getToken(user_id, (err, token) => {
            if (err) return res.status(500).send("Error checking token");

            if (token) {
                // Already logged in
                return res.status(200).send({ user_id: user_id, session_token: token });
            }

            // Create a new token if doesn't exist
            users.setToken(user_id, (err, newToken) => {
                if (err) return res.status(500).send("Error setting token");
                return res.status(200).send({ user_id: user_id, session_token: newToken });
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

const get_user_by_id = (req, res) => {
  const schema = Joi.object({
    user_id: Joi.number().integer().positive().required()
  });

  const { error, value } = schema.validate(req.params);
  if (error) {
    return res.status(400).send({ error_message: error.details[0].message });
  }

  const userId = value.user_id;

  users.getUserById(userId, (err, userRow) => {
    if (err) {
      console.error("DB ERROR (getUserById):", err);
      return res.status(500).send({ error_message: "Server error" });
    }

    if (!userRow) {
      return res.status(404).send({ error_message: "User not found" });
    }

    users.getItemsCreatedByUser(userId, (itemsErr, items) => {
      if (itemsErr) {
        console.error("DB ERROR (getItemsCreatedByUser):", itemsErr);
        return res.status(500).send({ error_message: "Server error" });
      }

      users.getBidsPlacedByUser(userId, (bidsErr, bids) => {
        if (bidsErr) {
          console.error("DB ERROR (getBidsPlacedByUser):", bidsErr);
          return res.status(500).send({ error_message: "Server error" });
        }

        return res.status(200).send({
          user_id: userRow.user_id,
          first_name: userRow.first_name,
          last_name: userRow.last_name,
          email: userRow.email,
          items: items,
          bids: bids
        });
      });
    });
  });
};


module.exports = {
    create_account: create_account,
    login: login,
    logout: logout,
    get_user_by_id: get_user_by_id
};


