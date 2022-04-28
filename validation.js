const { json } = require("body-parser");
const Joi = require("joi");
const { join } = require("./schemas/postAggregate");
Joi.objectId = require('joi-objectid')(Joi)


module.exports = {
    validateSignin,
    validatesLogin,
    validatePostLike,
    valdatesComment,
    validtaePost,
    validateCommentLike
}

/**
 * validates the singin parmaters.
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function validateSignin(req, res, next) {

    const JoiSchema = Joi.object({
        user: Joi.string()
            .trim()
            .min(5)
            .max(20)
            .alphanum()
            .required(),
        email: Joi.string()
            .email()
            .trim()
            .min(5)
            .max(50)

            .required(),
        password: Joi.string()
            .trim()
            .min(7)
            .max(12)
            .alphanum()
            .required(),
        gender: Joi.bool()
            .optional()
    });
    validation(JoiSchema, null, res, req, next);
}
/**
 * validates the Login parmaters.
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function validatesLogin(req, res, next) {

    const JoiSchema = Joi.object({
        user: Joi.string()
            .trim()
            .min(5)
            .max(20)
            .alphanum()
            .required(),
        password: Joi.string()
            .trim()
            .min(7)
            .max(12)
            .alphanum()
            .required()
    });
    validation(JoiSchema, null, res, req, next);
}

/**
 * validates the Like parmaters.
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function validatePostLike(req, res, next) {
    const JoiSchema = Joi.object({
        postId: Joi.objectId()
    });
    validation(null, JoiSchema, res, req, next);
}

function validateCommentLike(req, res, next) {
    const JoiSchema = Joi.object({
        postId: Joi.objectId(),
        commentId: Joi.objectId()
    });
    validation(null, JoiSchema, res, req, next);
}

/**
 * validates the Comment parmaters.
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function valdatesComment(req, res, next) {
    const BodySchema = Joi.object({
        content: Joi.string()
            .trim()
            .min(2)
            .max(100),
    });
    const paramsSchema = Joi.object({
        postId: Joi.objectId()
    });
    validation(BodySchema, paramsSchema, res, req, next);
}

/**
 * validates the Post parmaters.
 * @param {object} req 
 * @param {object} res 
 * @param {function} next 
 */
function validtaePost(req, res, next) {
    const JoiSchema = Joi.object({
        content: Joi.string()
            .trim()
            .min(2)
            .max(100)


    });
    validation(JoiSchema, null, res, req, next);
}

/**
 * validates the data format, and if its not good,
 * set code 403 (Forbidden).
 * @param {Joi.ObjectSchema<any>} BodyJoiSchema 
 * @param {object} res 
 * @param {object} req 
 * @param {function} next 
 */
function validation(BodyJoiSchema = null, UrlparamsSchema = null, res, req, next) {
    if (BodyJoiSchema) {
        const body = req.body
        const validatedBody = BodyJoiSchema.validate(body);
        if (validatedBody.error) {
            res.status(403).json({ message: validatedBody.error.details[0].message });
            return;
        } else {
            req.body = validatedBody.value;
        }
    }if(UrlparamsSchema) {
        const params = req.params
        const validatedParams = UrlparamsSchema.validate(params);
        if (validatedParams.error) {
            res.status(403).json({ message: validatedParams.error.details[0].message });
            return;
        } else {
            req.params = validatedParams.value;
        }
    }

    next();

}
