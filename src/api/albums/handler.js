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
        data: { albumId },
      })
      .code(201);
  }

  async getAlbumByIdHandler(request) {
    const album = await this._service.getAlbumById(request.params.id);
    return {
      status: 'success',
      data: { album },
    };
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    await this._service.editAlbumById(request.params.id, request.payload);
    return h.response({
      status: 'success',
      message: 'Berhasil memperbarui album',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    await this._service.deleteAlbumById(request.params.id);
    return h.response({
      status: 'success',
      message: 'Berhasil menghapus album',
    });
  }
}

module.exports = AlbumsHandler;
