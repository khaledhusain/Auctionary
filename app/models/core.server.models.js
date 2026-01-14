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

const getBidsForItem = (itemId, done) => {
  const sql = `
    SELECT user_id, amount, timestamp
    FROM bids
    WHERE item_id = ?
    ORDER BY amount DESC, timestamp DESC
  `;

  db.all(sql, [itemId], (err, rows) => {
    if (err) return done(err);
    return done(null, rows || []);
  });
};

const createItem = (item, done) => {
  const sql = `
    INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    item.name,
    item.description,
    item.starting_bid,
    item.start_date,
    item.end_date,
    item.creator_id
  ];

  db.run(sql, values, function (err) {
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

const searchItems = (filters, done) => {
  const where = [];
  const values = [];

  // keyword search in name/description
  if (filters.q) {
    where.push("(i.name LIKE ? OR IFNULL(i.description, '') LIKE ?)");
    const like = `%${filters.q}%`;
    values.push(like, like);
  }

  // status filter based on end_date (OPEN/CLOSED)
  if (filters.status === "OPEN") {
    where.push("i.end_date > ?");
    values.push(Date.now());
  } else if (filters.status === "CLOSED") {
    where.push("i.end_date <= ?");
    values.push(Date.now());
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Default sort: soonest ending first
  let orderBy = "i.end_date ASC";
  if (filters.sort_by === "ALPHABETICAL") orderBy = "i.name ASC";
  if (filters.sort_by === "HIGHEST_BID") orderBy = "highest_bid DESC";

  const sql = `
    SELECT
      i.item_id,
      i.name,
      i.end_date,
      i.starting_bid,
      COALESCE(MAX(b.amount), i.starting_bid) AS highest_bid
    FROM items i
    LEFT JOIN bids b ON b.item_id = i.item_id
    ${whereSql}
    GROUP BY i.item_id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  values.push(filters.limit, filters.offset);

  db.all(sql, values, (err, rows) => {
    if (err) return done(err);
    return done(null, rows || []);
  });
};


module.exports = {
  getItemById,
  getHighestBidForItem,
  getBidsForItem,
  createItem,
  searchItems
};
