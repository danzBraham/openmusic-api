const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().max(30).required(),
});

const PostSongToPlaylistSchemaPayload = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongInPlaylistSchemaPayload = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistSchemaPayload,
  DeleteSongInPlaylistSchemaPayload,
};
