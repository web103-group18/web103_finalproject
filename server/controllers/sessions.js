import { pool } from "../config/database.js"

const getSessions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*,
          sub.name AS subject_name,
          u.display_name AS host_name,
          COUNT(sm.user_id)::int AS member_count
       FROM sessions s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN users u ON s.host_id = u.id
       LEFT JOIN session_members sm ON sm.session_id = s.id
       GROUP BY s.id, sub.name, u.display_name
       ORDER BY s.start_time ASC`
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export {
  getSessions
}