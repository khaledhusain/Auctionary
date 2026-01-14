const joi = require('joi');

const search_items = (req, res) => {
    return res.sendStatus(500);
};

const create_item = (req, res) => {
    const schema = joi.object({
        name: joi.string().min(1).required(),
        description: joi.string().allow('', null),
        starting_bid: joi.number().greater(0).required(),
        end_date: joi.date().greater('now').required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    return res.sendStatus(500);
};

const get_item_by_id = (req, res) => {
    return res.sendStatus(500);
};

const place_bid = (req, res) => {
    const schema = joi.object({
    amount: joi.number().greater(0).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    return res.sendStatus(500);
};

const get_bids_for_item = (req, res) => {
    return res.sendStatus(500);
};

module.exports = {
    search_items: search_items,
    create_item: create_item,
    get_item_by_id: get_item_by_id,
    place_bid: place_bid,
    get_bids_for_item: get_bids_for_item
};
