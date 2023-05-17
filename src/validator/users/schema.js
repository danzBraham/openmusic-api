const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(30).required(),
  password: Joi.string().required(),
  fullname: Joi.string().max(50).required(),
});

module.exports = UserPayloadSchema;
