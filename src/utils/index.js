/* eslint-disable camelcase */
const mapDBAlbumToModel = ({ album_id, name, year }) => ({
  id: album_id,
  name,
  year,
});

const mapDBSongsToModel = ({ song_id, title, performer }) => ({
  id: song_id,
  title,
  performer,
});

// eslint-disable-next-line object-curly-newline
const mapDBSongToModel = ({ song_id, title, year, genre, performer, duration, albumId }) => ({
  id: song_id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

module.exports = {
  mapDBAlbumToModel,
  mapDBSongsToModel,
  mapDBSongToModel,
};
