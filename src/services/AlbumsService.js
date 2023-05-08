const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError } = require('../exceptions');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const albumId = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [albumId, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambah album');
    }

    return result.rows[0].id;
  }

  async getAlbumById(albumId) {
    const queryAlbum = {
      text: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [albumId],
    };
    const resultAlbum = await this._pool.query(queryAlbum);

    if (!resultAlbum.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const querySongsByAlbumId = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };
    const resultSongsByAlbumId = await this._pool.query(querySongsByAlbumId);

    return { ...resultAlbum.rows[0], songs: resultSongsByAlbumId.rows };
  }

  async editAlbumById(albumId, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album, ID album tidak ditemukan');
    }
  }

  async deleteAlbumById(albumId) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus album, ID album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
