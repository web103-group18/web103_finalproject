
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.jsx";
import "./BrowseSessions.css";

const BrowseSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsAPI
      .getSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="browse">
      <h1>Browse Sessions</h1>

      {loading && <p>Loading sessions...</p>}
      {error && <p role="alert">{error}</p>}

      <div className="session-list">
        {sessions.map((session) => (
          <article key={session.id} className="session-card">
            <h2>{session.title}</h2>

            <p className="subject">{session.subject_name}</p>

            <p>Hosted by {session.host_name}</p>

            <p>{session.description}</p>

            <p>
              {new Date(session.start_time).toLocaleString()} to{" "}
              {new Date(session.end_time).toLocaleTimeString()}
            </p>

            <p>
              {session.member_count}/{session.max_members} spots filled
            </p>

            {session.status === "Canceled" && (
              <span className="tag">Canceled</span>
            )}

            <Link
              to={`/sessions/${session.id}`}
              className="session-details-link"
            >
              View Details
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
};

export default BrowseSessions;
