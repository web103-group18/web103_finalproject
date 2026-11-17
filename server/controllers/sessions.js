
import { pool } from "../config/database.js";

const getSessions = async (req, res) => {
  try {
    const userId = req.user?.id ?? null;

    const result = await pool.query(
      `SELECT s.*,
          sub.name AS subject_name,
          u.display_name AS host_name,
          COUNT(sm.user_id)::int AS member_count,
          EXISTS (
            SELECT 1 FROM session_members
            WHERE session_id = s.id AND user_id = $1::int
          ) AS joined
       FROM sessions s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN users u ON s.host_id = u.id
       LEFT JOIN session_members sm ON sm.session_id = s.id
       GROUP BY s.id, sub.name, u.display_name
       ORDER BY s.start_time ASC`,
      [userId],
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

const updateSession = async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(401).json({
      error: "Please log in with GitHub first."
    });
  }

  const id = Number(req.params.id);
  const {
    title,
    description,
    subject_id,
    start_time,
    end_time,
    max_members
  } = req.body;

  const subjectId = Number(subject_id);
  const capacity = Number(max_members);
  const start = new Date(start_time);
  const end = new Date(end_time);

  if (
    !Number.isInteger(id) || id < 1 ||
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100 ||
    !Number.isInteger(subjectId) || subjectId < 1 ||
    !Number.isInteger(capacity) ||
    capacity < 1 || capacity > 100 ||
    !Number.isFinite(start.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    start <= new Date() ||
    end <= start ||
    (description != null &&
      typeof description !== "string")
  ) {
    return res.status(400).json({
      error: "Please provide valid session details."
    });
  }

  try {
    const existing = await pool.query(
      "SELECT host_id FROM sessions WHERE id = $1",
      [id]
    );

    if (!existing.rows.length) {
      return res.status(404).json({
        error: "Session not found."
      });
    }

    if (existing.rows[0].host_id !== req.user.id) {
      return res.status(403).json({
        error: "You can only edit your own sessions."
      });
    }

    const result = await pool.query(
      `UPDATE sessions
       SET title = $1,
           description = $2,
           subject_id = $3,
           start_time = $4,
           end_time = $5,
           max_members = $6
       WHERE id = $7
         AND host_id = $8
         AND $6 >= (
           SELECT COUNT(*)
           FROM session_members
           WHERE session_id = $7
         )
       RETURNING *`,
      [
        title.trim(),
        description?.trim() || "",
        subjectId,
        start,
        end,
        capacity,
        id,
        req.user.id
      ]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        error: "Capacity cannot be below current attendance."
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Update session failed:", error);

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid subject selected."
      });
    }

    return res.status(500).json({
      error: "Unable to update the session."
    });
  }
};

const joinSession = async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(401).json({
      error: "Please log in with GitHub first.",
    });
  }

  const sessionId = Number(req.params.id);

  if (!Number.isInteger(sessionId) || sessionId < 1) {
    return res.status(400).json({ error: "Invalid session id." });
  }

  const client = await pool.connect().catch(() => null);

  if (!client) {
    return res.status(500).json({
      error: "Database connection failed.",
    });
  }

  try {
    await client.query("BEGIN");

    // Lock the row so two people can't take the last spot at once
    const sessionResult = await client.query(
      "SELECT status, max_members FROM sessions WHERE id = $1 FOR UPDATE",
      [sessionId],
    );

    if (!sessionResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Session not found." });
    }

    const { status, max_members } = sessionResult.rows[0];

    if (status !== "Active") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "This session was canceled.",
      });
    }

    const count = await client.query(
      `SELECT COUNT(*)::int AS member_count
       FROM session_members WHERE session_id = $1`,
      [sessionId],
    );

    if (count.rows[0].member_count >= max_members) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This session is full." });
    }

    await client.query(
      `INSERT INTO session_members (session_id, user_id)
       VALUES ($1, $2)`,
      [sessionId, req.user.id],
    );

    await client.query("COMMIT");

    return res.status(201).json({ message: "Registered for session." });
  } catch (error) {
    await client.query("ROLLBACK");

    // 23505 = the composite primary key blocked a duplicate join
    if (error.code === "23505") {
      return res.status(409).json({
        error: "You are already registered for this session.",
      });
    }

    console.error("Join session failed:", error);

    return res.status(500).json({
      error: "Unable to register for the session.",
    });
  } finally {
    client.release();
  }
};

const cancelSession = async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(401).json({
      error: "Please log in with GitHub first.",
    });
  }

  const sessionId = Number(req.params.id);

  if (!Number.isInteger(sessionId) || sessionId < 1) {
    return res.status(400).json({ error: "Invalid session id." });
  }

  try {
    const existing = await pool.query(
      "SELECT host_id FROM sessions WHERE id = $1",
      [sessionId],
    );

    if (!existing.rows.length) {
      return res.status(404).json({ error: "Session not found." });
    }

    if (existing.rows[0].host_id !== req.user.id) {
      return res.status(403).json({
        error: "Only the host can cancel this session.",
      });
    }

    const result = await pool.query(
      `UPDATE sessions SET status = 'Canceled'
       WHERE id = $1 RETURNING *`,
      [sessionId],
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Cancel session failed:", error);

    return res.status(500).json({
      error: "Unable to cancel the session.",
    });
  }
};

const getMySessions = async (req, res) => {
  if (!req.isAuthenticated?.() || !req.user?.id) {
    return res.status(401).json({
      error: "Please log in with GitHub first.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT s.*,
          sub.name AS subject_name,
          u.display_name AS host_name,
          (SELECT COUNT(*)::int
           FROM session_members
           WHERE session_id = s.id) AS member_count,
          (s.host_id = $1) AS is_host
       FROM sessions s
       JOIN subjects sub ON s.subject_id = sub.id
       JOIN users u ON s.host_id = u.id
       WHERE s.host_id = $1
          OR EXISTS (
            SELECT 1 FROM session_members
            WHERE session_id = s.id AND user_id = $1
          )
       ORDER BY s.start_time ASC`,
      [req.user.id],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Get my sessions failed:", error);

    return res.status(500).json({
      error: "Unable to load your sessions.",
    });
  }
};

export {
  getSessions,
  createSession,
  updateSession,
  joinSession,
  cancelSession,
  getMySessions
};