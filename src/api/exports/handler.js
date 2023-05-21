class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportSongsInPlaylistHandler(request, h) {
    this._validator.validateExportSongsInPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    const message = {
      userId: credentialId,
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    this._producerService.sendMessage('export:songsInPlaylist', JSON.stringify(message));

    return h
      .response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      })
      .code(201);
  }
}

module.exports = ExportsHandler;
