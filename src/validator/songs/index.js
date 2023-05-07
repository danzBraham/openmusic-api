const { InvariantError } = require('../../exceptions');
const SongPayloadSchema = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload);
    if (validationResult.error) {
      const splitMessage = validationResult.error.message.split(' ')[0];
      const cleanMessage = splitMessage.replace(/"/g, '');
      throw new InvariantError(`${cleanMessage} tidak boleh kosong!`);
    }
  },
};

module.exports = SongsValidator;
