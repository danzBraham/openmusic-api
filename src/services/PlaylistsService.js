const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError, AuthorizationError } = require('../exceptions');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const { owner: playlistOwner } = result.rows[0];
    if (playlistOwner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.* FROM playlists
            LEFT JOIN users ON users.id = playlists.owner
            WHERE playlists.owner = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. ID tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambah ke playlist');
    }
  }

  async getSongsInPlaylist(id) {
    // const queryPlaylist = {
    //   text: 'SELECT * FROM playlists WHERE id = $1',
    //   values: [id],
    // };
    // const resultPlaylist = await this._pool.query(queryPlaylist);

    // if (!resultPlaylist.rowCount) {
    //   throw new NotFoundError('Playlist tidak ditemukan');
    // }

    // const querySongsInPlaylist = {
    //   text: `SELECT songs.* FROM songs
    //         LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
    //         WHERE playlists.id = $1
    //         GROUP BY songs.id`,
    //   values: [id],
    // };
    // const resultSongsInPlaylist = await this._pool.query(querySongsInPlaylist);

    // return { ...resultPlaylist.rows[0], songs: resultSongsInPlaylist.rows };

    const query = {
      text: `SELECT playlists.*, songs.* FROM playlists
            LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id
            LEFT JOIN songs ON songs.id = playlist_songs.song_id
            WHERE playlists.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    return {
      ...result.rows[0],
      songs: result.rows.map((row) => row.songs),
    };
  }

  async deleteSonginPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus pada playlist');
    }
  }
}

module.exports = PlaylistsService;
