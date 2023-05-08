/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    performer: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    genre: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
      default: null,
    },
    album_id: {
      type: 'VARCHAR(50)',
      default: null,
    },
  });

  pgm.addConstraint('songs', 'fk_songs_albums', {
    foreignKeys: {
      columns: 'album_id',
      references: 'albums(id)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs_albums');
  pgm.dropTable('songs');
};
