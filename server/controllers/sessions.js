
import { pool } from "../config/database.js";

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
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createSession = async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(401).json({
      error: "Please log in with GitHub first."
    });
  }

  const {
    title,
    description,
    subject_id,
    start_time,
    end_time,
    max_members
  } = req.body;

  const capacity = Number(max_members);
  const subjectId = Number(subject_id);
  const start = new Date(start_time);
  const end = new Date(end_time);

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100 ||
    !Number.isInteger(subjectId) ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 100 ||
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    end <= start ||
    start <= new Date()
  ) {
    return res.status(400).json({
      error: "Please enter valid session details and future dates."
    });
  }

  if (
    description != null &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      error: "Description must be text."
    });
  }

  const client = await pool.connect().catch(() => null);

  if (!client) {
    return res.status(500).json({
      error: "Database connection failed."
    });
  }

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO sessions
       (host_id, subject_id, title, description,
        start_time, end_time, max_members)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        subjectId,
        title.trim(),
        description?.trim() || "",
        start,
        end,
        capacity
      ]
    );

    const session = result.rows[0];

    await client.query(
      `INSERT INTO session_members (session_id, user_id)
       VALUES ($1, $2)`,
      [session.id, req.user.id]
    );

    await client.query("COMMIT");

    return res.status(201).json(session);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create session failed:", error);

    return res.status(500).json({
      error: "Unable to create the session."
    });
  } finally {
    client.release();
  }
};

export { getSessions, createSession };