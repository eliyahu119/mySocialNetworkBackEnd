const { json } = require("body-parser");
const Joi = require("joi");
const { join } = require("./schemas/postAggregate");
Joi.objectId = require('joi-objectid')(Joi)


module.exports={
    validateSignin,
    validatesLogin,
    valdatesAddLike,
    valdatesComment,
    validtaePost
}

/**
 * validates the singin function.
 */
function validateSignin(req,res,next)
{
    
    const JoiSchema = Joi.object({
    user: Joi.string()
             .trim()
             .min(5)
             .max(20) 
             .alphanum()
            .required(),
    email:  Joi.string()
                .email()
                .trim()
               .min(5)
               .max(50)
               
                .required(),
    password :Joi.string()
                 .trim()
                 .min(7)
                 .max(12)
                 .alphanum()
                 .required(),
    gender : Joi.bool()
             .optional()
 });
 validation(JoiSchema,  res, req, next);
}

function validatesLogin(req,res,next){
 
    const JoiSchema = Joi.object({
        user: Joi.string()
             .trim()
             .min(5)
             .max(20)
             .alphanum()
            .required(),
    password :Joi.string()
                 .trim()
                 .min(7)
                 .max(12)
                 .alphanum()
                 .required()
 });
 validation(JoiSchema,  res, req, next);
}

function valdatesAddLike(req,res,next){
    const JoiSchema = Joi.object({
       postCommentID :Joi.objectId()
                 
 });
 validation(JoiSchema,  res, req, next);
}


function valdatesComment(req,res,next){
    const JoiSchema = Joi.object({
        content :Joi.string()
                 .trim()
                 .min(2)
                 .max(100),
        postID:Joi.objectId()
                 
 });
   validation(JoiSchema,  res, req, next);
}

function validtaePost(req,res,next){
    const JoiSchema = Joi.object({
        content :Joi.string()
                    .trim()
                  .min(2)
                  .max(100)
                
                 
 }); 
    validation(JoiSchema,  res, req, next);
}

function validation(JoiSchema,res, req, next) {
    let value=req.body
    let validated = JoiSchema.validate(value);
    if (validated.error) {
        // console.log(validated.error.details)
        res.status(403).json({ message: validated.error.details[0].message });
    } else {
        
        req.body = validated.value;
        next();
    }
}
