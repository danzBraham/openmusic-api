class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const userId = await this._service.addUser(request.payload);

    return h
      .response({
        status: 'success',
        message: 'User berhasil ditambah',
        data: {
          userId,
        },
      })
      .code(201);
  }

  async getUserByIdHandler(request) {
    const user = await this._service.getUserById(request.params.id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }
}

module.exports = UsersHandler;
