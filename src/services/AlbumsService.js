const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError } = require('../exceptions');

class AlbumsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addAlbum({ name, year, coverUrl = null }) {
    const albumId = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
      values: [albumId, name, year, coverUrl],
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

    const album = {
      id: rows[0].id,
      name: rows[0].name,
      year: rows[0].year,
      coverUrl: rows[0].cover_url,
    };

    return { ...album, songs: resultSongsByAlbumId };
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

  async editCoverUrlAlbumById(albumId, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, albumId],
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

  async verifyAlbum(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async verifyUsersWhoLikedAlbum(userId, albumId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (rowCount > 0) {
      throw new InvariantError('User sudah menyukai album');
    }
  }

  async addUserLikesAlbum(userId, albumId) {
    const id = `user-album-likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
      values: [id, userId, albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('User gagal menyukai album');
    }
  }

  async getUsersWhoLikedAlbum(albumId) {
    const query = {
      text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    };
    const { rows } = await this._pool.query(query);

    return parseInt(rows[0].count, 10);
  }

  async deleteUsersWhoLikedAlbum(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('User gagal batal menyukai album');
    }
  }
}

module.exports = AlbumsService;
