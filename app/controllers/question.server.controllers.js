const joi = require("joi");

const get_questions_for_item = (req, res) => {
    return res.sendStatus(500);
};

const create_question_for_item = (req, res) => {
    const schema = joi.object({
        question: joi.string().min(1).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    return res.sendStatus(500);
};

const answer_question = (req, res) => {
    const schema = joi.object({
        answer: joi.string().min(1).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    return res.sendStatus(500);
};

module.exports = {
    get_questions_for_item: get_questions_for_item,
    create_question_for_item: create_question_for_item,
    answer_question: answer_question
};
