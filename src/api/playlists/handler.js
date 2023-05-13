class PlaylistsHandler {
  constructor(playlistsService, songsService, validator) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { name } = request.payload;
    const playlistId = await this._playlistsService.addPlaylist(name, credentialId);

    return h
      .response({
        status: 'success',
        data: {
          playlistId,
        },
      })
      .code(201);
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.body;

    await this._playlistsService.addSongToPlaylist(playlistId, songId);

    return h
      .response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
      })
      .code(201);
  }

  async getSongsInPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const playlist = await this._playlistsService.getSongsInPlaylist(playlistId);

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongInPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { songId } = request.body;

    await this._songsService.verifySongId(songId);
    await this._playlistsService.deleteSonginPlaylist(playlistId, songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
