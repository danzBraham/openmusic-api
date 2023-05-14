const { InvariantError } = require('../../exceptions');
const {
  PostPlaylistPayloadSchema,
  PostSongToPlaylistSchemaPayload,
  DeleteSongInPlaylistSchemaPayload,
} = require('./schema');

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validatePostSongToPlaylistPayload: (payload) => {
    const validationResult = PostSongToPlaylistSchemaPayload.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeleteSongInPlaylistPayload: (payload) => {
    const validationResult = DeleteSongInPlaylistSchemaPayload.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
