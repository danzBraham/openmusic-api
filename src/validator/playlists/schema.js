const Joi = require('joi');

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().max(30).required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongInPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongInPlaylistPayloadSchema,
};
