import { pool } from "../config/database.js"

const getSubjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY id ASC')
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
};

export {
  getSubjects
}