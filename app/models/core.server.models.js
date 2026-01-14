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
    where.push("i.creator_id = ?");
    where.push("i.end_date > ?");
    values.push(filters.user_id, Date.now());
  }

  if (filters.status === "ARCHIVE") {
    where.push("i.creator_id = ?");
    where.push("i.end_date <= ?");
    values.push(filters.user_id, Date.now());
  }

  if (filters.status === "BID") {
  where.push(`
    (
      SELECT b2.user_id
      FROM bids b2
      WHERE b2.item_id = i.item_id
      ORDER BY b2.amount DESC, b2.timestamp DESC
      LIMIT 1
    ) = ?
  `);
  values.push(filters.user_id);
}




  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sql = `
    SELECT
    i.item_id,
    i.name,
    IFNULL(i.description, '') AS description,
    i.creator_id,
    u.first_name,
    u.last_name,
    i.end_date,
    COALESCE(MAX(b.amount), i.starting_bid) AS highest_bid

    FROM items i
    JOIN users u ON u.user_id = i.creator_id
    LEFT JOIN bids b ON b.item_id = i.item_id
    ${whereSql}
    GROUP BY i.item_id
    ORDER BY i.end_date ASC
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
