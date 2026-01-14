const db = require('../../database');

const createQuestion = (itemId, askedBy, questionText, done) => {
  const sql = `
    INSERT INTO questions (question, answer, asked_by, item_id)
    VALUES (?, NULL, ?, ?)
  `;
  db.run(sql, [questionText, askedBy, itemId], function (err) {
    if (err) return done(err);
    return done(null, this.lastID);
  });
};

const getQuestionById = (questionId, done) => {
  const sql = `
    SELECT question_id, question, answer, asked_by, item_id
    FROM questions
    WHERE question_id = ?
  `;
  db.get(sql, [questionId], (err, row) => {
    if (err) return done(err);
    return done(null, row);
  });
};

const setAnswer = (questionId, answerText, done) => {
  const sql = `
    UPDATE questions
    SET answer = ?
    WHERE question_id = ?
  `;
  db.run(sql, [answerText, questionId], function (err) {
    if (err) return done(err);
    return done(null, this.changes); // 0 if not found
  });
};

const getQuestionsForItem = (itemId, done) => {
  const sql = `
    SELECT
      q.question_id,
      q.question,
      IFNULL(q.answer, '') AS answer,
      q.asked_by,
      u.first_name,
      u.last_name
    FROM questions q
    JOIN users u ON u.user_id = q.asked_by
    WHERE q.item_id = ?
    ORDER BY q.question_id DESC
  `;
  db.all(sql, [itemId], (err, rows) => {
    if (err) return done(err);
    return done(null, rows || []);
  });
};

module.exports = {
  createQuestion,
  getQuestionById,
  setAnswer,
  getQuestionsForItem
};
