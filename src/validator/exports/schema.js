const Joi = require('joi');

const ExportSongsInPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).trim().required().messages({
    'string.base': 'Email target harus berupa string',
    'string.empty': 'Email target tidak boleh kosong',
    'string.email': 'Email target harus email yang valid',
    'string.trim': 'Email target tidak boleh diawali dan diakhiri dengan spasi',
  }),
});

module.exports = ExportSongsInPlaylistPayloadSchema;
