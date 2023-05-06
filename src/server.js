require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums/index');
const AlbumsService = require('./services/postgres/AlbumsService');
const { ClientError } = require('./exceptions/index');

const init = async () => {
  const albumsService = new AlbumsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: response.message,
          })
          .code(response.statusCode);
      }

      if (!response.isServer) {
        return h.continue;
      }

      return h
        .response({
          status: 'fail',
          message: 'Mohon maaf, terjadi kegagalan pada server kami',
        })
        .code(500);
    }

    return h.continue;
  });

  await server.register({
    plugin: albums,
    options: { albumsService },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
