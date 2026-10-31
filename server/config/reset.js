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
        github_username VARCHAR(39) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500) NOT NULL,
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
    `)
    console.log("Tables created and seeded.")
  } catch (error) {
    console.error('Reset failed', error);
  }
  
  await pool.end()
}

reset();