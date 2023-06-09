const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError } = require('../exceptions');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration = null, albumId = null }) {
    const songId = `song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [songId, title, year, performer, genre, duration, albumId],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Gagal menambah lagu');
    }

    return rows[0].id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: 'SELECT id, title, performer FROM songs',
    };

    if (title) {
      query.text = 'SELECT id, title, performer FROM songs WHERE title ILIKE $1';
      query.values = [`%${title}%`];
    }
    if (performer) {
      query.text = 'SELECT id, title, performer FROM songs WHERE performer ILIKE $1';
      query.values = [`%${performer}%`];
    }
    if (title && performer) {
      query.text = 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2';
      query.values = [`%${title}%`, `%${performer}%`];
    }

    const { rows } = await this._pool.query(query);
    return rows;
  }

  async getSongsByAlbumId(albumId) {
    const querySongsByAlbumId = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };
    const { rows } = await this._pool.query(querySongsByAlbumId);

    return rows;
  }

  async getSongById(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return rows[0];
  }

  async editSongById(songId, { title, year, performer, genre, duration, albumId }) {
    const query = {
      text: `UPDATE songs SET
            title = $1,
            year = $2,
            performer = $3,
            genre = $4,
            duration = $5,
            album_id = $6
            WHERE id = $7 RETURNING id`,
      values: [title, year, performer, genre, duration, albumId, songId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, ID lagu tidak ditemukan');
    }
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [songId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus lagu, ID lagu tidak ditemukan');
    }
  }

  async verifySong(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
