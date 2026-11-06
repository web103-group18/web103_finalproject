import { Strategy as GitHubStrategy } from "passport-github2";
import { pool } from "./database.js";

const options = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3001/auth/github/callback",
};

const verify = async (accessToken, refreshToken, profile, callback) => {
  const {
    _json: { id, name, login, avatar_url },
  } = profile;

  try {
    const results = await pool.query(
      "SELECT * FROM users WHERE github_id = $1",
      [id],
    );
    const user = results.rows[0];

    if (!user) {
      const inserted = await pool.query(
        `INSERT INTO users (github_id, username, display_name, avatar_url, access_token)
        VALUES($1, $2, $3, $4, $5)
        RETURNING *`,
        [id, login, name || login, avatar_url, accessToken],
      );

      const newUser = inserted.rows[0];
      return callback(null, newUser);
    }

    return callback(null, user);
  } catch (error) {
    return callback(error);
  }
};

export const GitHub = new GitHubStrategy(options, verify);