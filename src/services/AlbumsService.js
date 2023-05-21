const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError } = require('../exceptions');

class AlbumsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addAlbum({ name, year }) {
    const albumId = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [albumId, name, year],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Gagal menambah album');
    }

    return rows[0].id;
  }

  async getAlbumById(albumId) {
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };
    const { rowCount, rows } = await this._pool.query(queryAlbum);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const resultSongsByAlbumId = await this._songsService.getSongsByAlbumId(albumId);

    return { ...rows[0], songs: resultSongsByAlbumId };
  }

  async editAlbumById(albumId, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album, ID album tidak ditemukan');
    }
  }

  async deleteAlbumById(albumId) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus album, ID album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
