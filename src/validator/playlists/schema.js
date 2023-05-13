const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistSchemaPayload = Joi.object({
  songId: Joi.string().required(),
});

module.exports = { PostPlaylistPayloadSchema, PostSongToPlaylistSchemaPayload };
