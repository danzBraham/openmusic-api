const { Pool } = require('pg');
const { InvariantError } = require('../exceptions');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }

  async verifyRefreshToken(refreshToken) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [refreshToken],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Refresh Token tidak valid');
    }
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
    await this._pool.query(query);
  }

  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this._pool.query(query);
  }
}

module.exports = AuthenticationsService;
