const joi = require('joi');
const coreModel = require('../models/core.server.models');
const users = require('../models/user.server.models');


const search_items = (req, res) => {
    const schema = joi.object({
        q: joi.string().allow('').optional(),
        status: joi.string().valid("OPEN", "BID", "ARCHIVE").optional(),
        limit: joi.number().integer().min(1).max(100).optional(),
        offset: joi.number().integer().min(0).optional()
    }).unknown(true);

    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const filters = {
        q: value.q && value.q.trim() !== "" ? value.q.trim() : null,
        status: value.status || null,
        user_id: null,
        limit: value.limit || 10,
        offset: value.offset || 0
    };

    // So we manually validate X-Authorization for status searches.
    if (filters.status) {
        const token = req.get('X-Authorization');
        if (!token) {
            return res.status(400).send({ error_message: "Authentication required for status filter" });
        }

        return users.getIDFromToken(token, (authErr, userId) => {
            if (authErr || !userId) {
                return res.status(400).send({ error_message: "Authentication required for status filter" });
            }

            filters.user_id = userId;

            coreModel.searchItems(filters, (dbErr, rows) => {
                if (dbErr) {
                    console.error("DB ERROR (searchItems):", dbErr);
                    return res.status(500).send({ error_message: "Server error" });
                }

                return res.status(200).send(rows.map(r => ({
                    item_id: r.item_id,
                    name: r.name,
                    description: r.description,
                    end_date: r.end_date,
                    highest_bid: r.highest_bid,
                    creator_id: r.creator_id,
                    first_name: r.first_name,
                    last_name: r.last_name
                })));
            });
        });
    }

    // No status filter: public search
    coreModel.searchItems(filters, (dbErr, rows) => {
        if (dbErr) {
            console.error("DB ERROR (searchItems):", dbErr);
            return res.status(500).send({ error_message: "Server error" });
        }

        // Return list of items
        return res.status(200).send(rows.map(r => ({
            item_id: r.item_id,
            name: r.name,
            description: r.description,
            end_date: r.end_date,
            highest_bid: r.highest_bid,
            creator_id: r.creator_id,
            first_name: r.first_name,
            last_name: r.last_name
        })));
    });
};



const create_item = (req, res) => {
    const schema = joi.object({
        name: joi.string().min(1).required(),
        description: joi.string().min(1).required(),
        starting_bid: joi.number().greater(0).required(),
        end_date: joi.date().greater('now').required()
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const item = {
        name: value.name,
        description: value.description ?? "",
        starting_bid: Math.floor(value.starting_bid),
        start_date: Date.now(),
        end_date: new Date(value.end_date).getTime(),
        creator_id: req.authenticatedUserID
    };

    coreModel.createItem(item, (err, newId) => {
        if (err) {
            console.error("DB ERROR (createItem):", err);
            return res.status(500).send({ error_message: "Server error" });
        }
        return res.status(201).send({ item_id: newId });
    });
};


const get_item_by_id = (req, res) => {
    const schema = joi.object({
        item_id: joi.number().integer().positive().required()
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const itemId = value.item_id;

    coreModel.getItemById(itemId, (err, item) => {
        if (err) {
            console.error("DB ERROR (getItemById):", err);
            return res.status(500).send({ error_message: "Server error" });
        }

        if (!item) {
            return res.status(404).send({ error_message: "Item not found" });
        }

        coreModel.getHighestBidForItem(itemId, (bidErr, highestBid) => {
            if (bidErr) {
                console.error("DB ERROR (getHighestBidForItem):", bidErr);
                return res.status(500).send({ error_message: "Server error" });
            }

            if (item.description === null) item.description = '';

            return res.status(200).send({
                item_id: item.item_id,
                name: item.name,
                description: item.description,
                starting_bid: item.starting_bid,
                start_date: item.start_date,
                end_date: item.end_date,
                creator_id: item.creator_id,

                // highest bid info (default bidder empty if none)
                highest_bid: highestBid ? highestBid.amount : item.starting_bid,
                highest_bidder_id: highestBid ? highestBid.user_id : ""
            });
        });
    });
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
    const schema = joi.object({
        item_id: joi.number().integer().positive().required()
    });

    const { error, value } = schema.validate(req.params);
    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const itemId = value.item_id;

    // Make sure item exists
    coreModel.getItemById(itemId, (err, item) => {
        if (err) {
            console.error("DB ERROR (getItemById):", err);
            return res.status(500).send({ error_message: "Server error" });
        }

        if (!item) {
            return res.status(404).send({ error_message: "Item not found" });
        }

        coreModel.getBidsForItem(itemId, (bidErr, bids) => {
            if (bidErr) {
                console.error("DB ERROR (getBidsForItem):", bidErr);
                return res.status(500).send({ error_message: "Server error" });
            }

            // return bid history (empty array if none)
            return res.status(200).send(
                bids.map(b => ({
                    bidder_id: b.user_id,
                    amount: b.amount,
                    timestamp: b.timestamp
                }))
            );
        });
    });
};


module.exports = {
    search_items: search_items,
    create_item: create_item,
    get_item_by_id: get_item_by_id,
    place_bid: place_bid,
    get_bids_for_item: get_bids_for_item
};
