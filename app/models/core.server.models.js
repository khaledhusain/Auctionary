const db = require('../../database');

// Get item row by id
const getItemById = (itemId, done) => {
  const sql = `
    SELECT item_id, name, description, starting_bid, start_date, end_date, creator_id
    FROM items
    WHERE item_id = ?
  `;

  db.get(sql, [itemId], (err, row) => {
    if (err) return done(err);
    return done(null, row);
  });
};

const getHighestBidForItem = (itemId, done) => {
  const sql = `
    SELECT user_id, amount
    FROM bids
    WHERE item_id = ?
    ORDER BY amount DESC, timestamp DESC
    LIMIT 1
  `;

  db.get(sql, [itemId], (err, row) => {
    if (err) return done(err);
    return done(null, row);
  });
};

module.exports = {
  getItemById,
  getHighestBidForItem
};
