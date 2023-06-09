const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { InvariantError, NotFoundError, AuthorizationError } = require('../exceptions');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
            INNER JOIN users ON users.id = playlists.owner
            LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
            WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const { rows } = await this._pool.query(query);

    return rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. ID tidak ditemukan');
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Lagu gagal ditambah ke playlist');
    }
  }

  async getSongsInPlaylist(playlistId, owner) {
    const query = {
      text: `SELECT playlists.id AS playlist_id, playlists.name, users.username,
            songs.id AS song_id, songs.title, songs.performer
            FROM playlist_songs
            INNER JOIN playlists ON playlists.id = playlist_songs.playlist_id
            INNER JOIN songs ON songs.id = playlist_songs.song_id
            INNER JOIN users ON users.id = playlists.owner
            WHERE playlists.id = $1 AND (playlists.owner = $2 OR playlists.id IN (
              SELECT playlist_id FROM collaborations WHERE user_id = $2
            ))`,
      values: [playlistId, owner],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    const playlist = {
      id: rows[0].playlist_id,
      name: rows[0].name,
      username: rows[0].username,
    };

    const songs = rows.map((row) => ({
      id: row.song_id,
      title: row.title,
      performer: row.performer,
    }));

    return {
      ...playlist,
      songs,
    };
  }

  async deleteSonginPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Lagu gagal dihapus pada playlist');
    }
  }

  async addSongToPlaylistActivities(playlistId, songId, userId, action) {
    const id = `playlist-song-actv-${nanoid(16)}`;
    const time = new Date();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, playlistId, songId, userId, action, time],
    };
    const { rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new InvariantError('Aktivitas lagu pada playlist gagal ditambah');
    }
  }

  async getPlaylistActivites(id, owner) {
    const query = {
      text: `SELECT playlist_song_activities.playlist_id, playlist_song_activities.action, playlist_song_activities.time,
            users.username, songs.title
            FROM playlist_song_activities
            INNER JOIN users ON users.id = playlist_song_activities.user_id
            INNER JOIN songs ON songs.id = playlist_song_activities.song_id
            WHERE playlist_song_activities.playlist_id = $1 AND playlist_song_activities.user_id = $2`,
      values: [id, owner],
    };
    const { rows } = await this._pool.query(query);

    const activities = rows.map((row) => ({
      username: row.username,
      title: row.title,
      action: row.action,
      time: row.time,
    }));

    return {
      playlistId: rows[0].playlist_id,
      activities,
    };
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const { rowCount, rows } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const { owner: playlistOwner } = rows[0];
    if (playlistOwner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;
