const joi = require("joi");

const coreModel = require('../models/core.server.models');
const questionModel = require('../models/question.server.models');

const get_questions_for_item = (req, res) => {
    const schema = joi.object({
        item_id: joi.number().integer().positive().required()
    });

    const { error, value } = schema.validate(req.params);
    if (error) return res.status(400).send({ error_message: error.details[0].message });

    const itemId = value.item_id;

    coreModel.getItemById(itemId, (err, item) => {
        if (err) return res.status(500).send({ error_message: "Server error" });
        if (!item) return res.status(404).send({ error_message: "Item not found" });

        questionModel.getQuestionsForItem(itemId, (qErr, rows) => {
            if (qErr) return res.status(500).send({ error_message: "Server error" });

            return res.status(200).send(rows.map(r => ({
                question_id: r.question_id,
                question: r.question,
                answer: r.answer,
                asked_by: r.asked_by,
                first_name: r.first_name,
                last_name: r.last_name
            })));
        });
    });
};

const create_question_for_item = (req, res) => {
    const paramsSchema = joi.object({
        item_id: joi.number().integer().positive().required()
    });

    const { error: pErr, value: pVal } = paramsSchema.validate(req.params);
    if (pErr) return res.status(400).send({ error_message: pErr.details[0].message });

    const bodySchema = joi.object({
        question: joi.string().min(1),
        text: joi.string().min(1),
        question_text: joi.string().min(1),
        questionText: joi.string().min(1),
        content: joi.string().min(1)
    }).or('question', 'text', 'question_text', 'questionText', 'content');

    const { error: bErr, value: bVal } = bodySchema.validate(req.body);
    if (bErr) return res.status(400).send({ error_message: bErr.details[0].message });

    const itemId = pVal.item_id;
    const askerId = req.authenticatedUserID;
    const questionText = (bVal.question || bVal.text || bVal.question_text || bVal.questionText || bVal.content).trim();

    coreModel.getItemById(itemId, (err, item) => {
        if (err) return res.status(500).send({ error_message: "Server error" });
        if (!item) return res.status(404).send({ error_message: "Item not found" });

        if (item.creator_id === askerId) {
            return res.status(403).send({ error_message: "Cannot ask question on your own item" });
        }

        questionModel.createQuestion(itemId, askerId, questionText, (cErr, newId) => {
            if (cErr) return res.status(500).send({ error_message: "Server error" });
            return res.status(200).send({ question_id: newId });
        });
    });
};


const answer_question = (req, res) => {
    const paramsSchema = joi.object({
        question_id: joi.number().integer().positive().required()
    });

    const { error: pErr, value: pVal } = paramsSchema.validate(req.params);
    if (pErr) return res.status(400).send({ error_message: pErr.details[0].message });

    const bodySchema = joi.object({
        answer: joi.string().min(1),
        text: joi.string().min(1),
        answer_text: joi.string().min(1),
        answerText: joi.string().min(1),
        content: joi.string().min(1)
    }).or('answer', 'text', 'answer_text', 'answerText', 'content');

    const { error: bErr, value: bVal } = bodySchema.validate(req.body);
    if (bErr) return res.status(400).send({ error_message: bErr.details[0].message });

    const questionId = pVal.question_id;
    const answerText = (bVal.answer || bVal.text || bVal.answer_text || bVal.answerText || bVal.content).trim();
    const userId = req.authenticatedUserID;

    questionModel.getQuestionById(questionId, (err, qRow) => {
        if (err) return res.status(500).send({ error_message: "Server error" });
        if (!qRow) return res.status(404).send({ error_message: "Question not found" });

        coreModel.getItemById(qRow.item_id, (iErr, item) => {
            if (iErr) return res.status(500).send({ error_message: "Server error" });
            if (!item) return res.status(404).send({ error_message: "Item not found" });

            if (item.creator_id !== userId) {
                return res.status(403).send({ error_message: "Only the creator can answer questions" });
            }

            questionModel.setAnswer(questionId, answerText, (uErr, changes) => {
                if (uErr) return res.status(500).send({ error_message: "Server error" });
                if (!changes) return res.status(404).send({ error_message: "Question not found" });
                return res.sendStatus(200);
            });
        });
    });
};

module.exports = {
    get_questions_for_item,
    create_question_for_item,
    answer_question
};
