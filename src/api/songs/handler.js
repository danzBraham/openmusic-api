class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const songId = await this._service.addSong(request.payload);
    return h
      .response({
        status: 'success',
        data: { songId },
      })
      .code(201);
  }

  async getSongsHandler() {
    const songs = await this._service.getSongs();
    return {
      status: 'success',
      data: { songs },
    };
  }

  async getSongByIdHandler(request) {
    const song = await this._service.getSongById(request.params.id);
    return {
      status: 'success',
      data: { song },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    await this._service.editSongById(request.params.id, request.payload);
    return {
      status: 'success',
      message: 'Berhasil memperbarui lagu',
    };
  }

  async deleteSongByIdHandler(request) {
    await this._service.deleteSongById(request.params.id);
    return {
      status: 'success',
      message: 'Berhasil menghapus lagu',
    };
  }
}

module.exports = SongsHandler;
