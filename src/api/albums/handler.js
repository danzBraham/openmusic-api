class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const albumId = await this._service.addAlbum(request.payload);

    return h
      .response({
        status: 'success',
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async getAlbumByIdHandler(request) {
    const album = await this._service.getAlbumById(request.params.id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    await this._service.editAlbumById(request.params.id, request.payload);

    return {
      status: 'success',
      message: 'Berhasil memperbarui album',
    };
  }

  async deleteAlbumByIdHandler(request) {
    await this._service.deleteAlbumById(request.params.id);
    return {
      status: 'success',
      message: 'Berhasil menghapus album',
    };
  }

  async postUserLikesAlbumHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.verifyAlbum(albumId);
    await this._service.verifyUsersWhoLikedAlbum(credentialId, albumId);
    await this._service.addUserLikesAlbum(credentialId, albumId);

    return h
      .response({
        status: 'success',
        message: 'User menyukai album',
      })
      .code(201);
  }

  async getUsersWhoLikedAlbumHandler(request, h) {
    const { id: albumId } = request.params;
    const { likes, cache } = await this._service.getUsersWhoLikedAlbum(albumId);

    const responseData = {
      status: 'success',
      data: {
        likes,
      },
    };

    const response = h.response(responseData);

    if (cache) {
      return response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async deleteUsersWhoLikedAlbumHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteUsersWhoLikedAlbum(credentialId, albumId);

    return {
      status: 'success',
      message: 'User batal menyukai album',
    };
  }
}

module.exports = AlbumsHandler;
