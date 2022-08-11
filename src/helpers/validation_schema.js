const joi = require('joi');

const userScheme = joi.object({
    name: joi.string().required(),
    email: joi.string().lowercase().email().required(),
    password: joi.string().min(8).required(),
    phone: joi.string().required(),
    gender: joi.string().required(),

}).options({ stripUnknown: true });

const loginValidation = joi.object({
    email: joi.string().lowercase().email().required(),
    password: joi.string().min(8).required()
}).options({ stripUnknown: true });

const editValidation = joi.object({
    name: joi.string().required(),
    email: joi.string().lowercase().email().required(),
    phone: joi.string().required(),
}).options({ stripUnknown: true });

const changePassword = joi.object({
    oldPassword: joi.string().min(8).required(),
    password: joi.string().min(8).required()
})

module.exports = { userScheme, loginValidation, editValidation, changePassword };