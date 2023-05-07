const { InvariantError } = require('../../exceptions/index');
const AlbumPayloadSchema = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      const splitMessage = validationResult.error.message.split(' ')[0];
      const cleanMessage = splitMessage.replace(/"/g, '');
      throw new InvariantError(`${cleanMessage} tidak boleh kosong!`);
    }
  },
};

module.exports = AlbumsValidator;
