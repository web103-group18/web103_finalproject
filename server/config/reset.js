import { pool } from './database.js'

const reset = async () => {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS session_members;
      DROP TABLE IF EXISTS sessions;
      DROP TABLE IF EXISTS subjects;
      DROP TABLE IF EXISTS users;
      
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        github_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(39) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500) NOT NULL,
        access_token VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE sessions (
        id SERIAL PRIMARY KEY,
        host_id INTEGER NOT NULL REFERENCES users(id),
        subject_id INTEGER NOT NULL REFERENCES subjects(id),
        title VARCHAR(100) NOT NULL, 
        description TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        max_members INTEGER NOT NULL DEFAULT 6,
        status VARCHAR(20) NOT NULL DEFAULT 'Active'
          CHECK (status IN ('Active', 'Canceled')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE session_members (
        session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT NOW()
      );

      
      INSERT INTO subjects (name) VALUES
        ('Computer Science'), ('Math'), ('Physics'), ('Biology'), ('Chemistry'), ('English'), ('History'), ('Business'), ('Other');

      INSERT INTO users (github_id, username, display_name, avatar_url) VALUES
        (1001, 'testuser1', 'Test User One', 'https://avatars.githubusercontent.com/u/1001'),
        (1002, 'testuser2', 'Test User Two', 'https://avatars.githubusercontent.com/u/1002');

      INSERT INTO sessions
        (host_id, subject_id, title, description, start_time, end_time, max_members, status)
      VALUES
        (
          (SELECT id FROM users WHERE username = 'testuser1'),
          (SELECT id FROM subjects WHERE name = 'Computer Science'),
          'CS101 Midterm Review',
          'Going over recursion and sorting before the midterm.',
          '2026-11-05 18:00:00', '2026-11-05 20:00:00', 6, 'Active'
        ),
        (
          (SELECT id FROM users WHERE username = 'testuser2'),
          (SELECT id FROM subjects WHERE name = 'Math'),
          'Calculus Problem Set Grind',
          'Working through the week 9 problem set together.',
          '2026-11-06 16:30:00', '2026-11-06 18:00:00', 6, 'Active'
        ),
        (
          (SELECT id FROM users WHERE username = 'testuser1'),
          (SELECT id FROM subjects WHERE name = 'Biology'),
          'Intro Biology Study Group',
          'Reviewing cell structure and photosynthesis.',
          '2026-11-07 14:00:00', '2026-11-07 15:30:00', 5, 'Canceled'
        );

      INSERT INTO session_members (session_id, user_id)
      SELECT id, host_id FROM sessions;
    `);
    console.log("Tables created and seeded.")
  } catch (error) {
    console.error('Reset failed', error);
  }
  
  await pool.end()
}

reset();