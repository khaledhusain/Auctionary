const questions = require('../controllers/question.server.controllers');
const authenticate = require('../lib/authentication');

module.exports = function (app) {
    app.route("/item/:item_id/question")
        .get(questions.get_questions_for_item)                 
        .post(authenticate, questions.create_question_for_item); 

    app.route("/question/:question_id")
        .post(authenticate, questions.answer_question);
};
