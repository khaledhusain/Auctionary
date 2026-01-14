const core = require("../controllers/core.server.controllers");
const authenticate = require("../lib/authentication");

module.exports = function(app) {
    app.route("/search")
        .get(core.search_items);

    app.route("/item")
        .post(authenticate, core.create_item);

    app.route("/item/:item_id")
        .get(core.get_item_by_id);

    app.route("/item/:item_id/bid")
        .post(authenticate, core.place_bid)
        .get(core.get_bids_for_item);
};
