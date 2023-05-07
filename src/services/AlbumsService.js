const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError } = require('../exceptions');
const { mapDBAlbumToModel, mapDBSongsToModel } = require('../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const albumId = nanoid(16);

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING album_id',
      values: [albumId, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].album_id) {
      throw new InvariantError('Gagal menambah album');
    }

    return result.rows[0].album_id;
  }

  async getAlbumById(albumId) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE album_id = $1',
      values: [albumId],
    };
    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongsByAlbumId = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [albumId],
    };
    const resultSongsByAlbumId = await this._pool.query(querySongsByAlbumId);

    const mapAlbum = resultAlbum.rows.map(mapDBAlbumToModel)[0];
    const mapSongs = resultSongsByAlbumId.rows.map(mapDBSongsToModel);

    return { ...mapAlbum, songs: mapSongs };
  }

  async editAlbumById(albumId, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
      values: [name, year, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, ID album tidak ditemukan');
    }
  }

  async deleteAlbumById(albumId) {
    const query = {
      text: 'DELETE FROM albums WHERE album_id = $1 RETURNING album_id',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album, ID album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
