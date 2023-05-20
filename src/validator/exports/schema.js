const Joi = require('joi');

const ExportSongsInPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).trim().required(),
});

module.exports = ExportSongsInPlaylistPayloadSchema;
