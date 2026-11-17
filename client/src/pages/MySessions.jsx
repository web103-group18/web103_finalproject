import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.js";
import "./BrowseSessions.css";
import "./MySessions.css";

const SessionCard = ({ session }) => (
  <article className="session-card">
    <h2>{session.title}</h2>

    <div className="card-tags">
      <p className="subject">{session.subject_name}</p>
      {session.status === "Canceled" && <span className="tag">Canceled</span>}
    </div>

    <p>Hosted by {session.host_name}</p>
    <p>{session.description}</p>
    <p>
      {new Date(session.start_time).toLocaleString()} to{" "}
      {new Date(session.end_time).toLocaleTimeString()}
    </p>
    <p>
      {session.member_count}/{session.max_members} spots filled
    </p>

    <Link to={`/sessions/${session.id}`}>View Details</Link>
  </article>
);

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    sessionsAPI
      .getMySessions()
      .then(setSessions)
      .catch((err) => {
        if (err.status === 401) setLoggedOut(true);
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const hosting = sessions.filter((s) => s.is_host);
  const registered = sessions.filter((s) => !s.is_host);

  if (loading) {
    return (
      <main className="browse my-sessions">
        <h1>My Sessions</h1>
        <p>Loading your sessions...</p>
      </main>
    );
  }

  if (loggedOut) {
    return (
      <main className="browse my-sessions">
        <h1>My Sessions</h1>
        <div className="my-sessions-login">
          <p>Log in to see the sessions you're hosting and registered for.</p>
          <a href="/auth/github">Log in with GitHub</a>
        </div>
      </main>
    );
  }

  return (
    <main className="browse my-sessions">
      <h1>My Sessions</h1>

      {error && <p role="alert">{error}</p>}

      <section className="my-sessions-section">
        <div className="my-sessions-heading">
          <h2>Hosting</h2>
          <Link to="/sessions/create">+ Create Session</Link>
        </div>

        {hosting.length === 0 ? (
          <p className="empty-note">You're not hosting any sessions yet.</p>
        ) : (
          <div className="session-list">
            {hosting.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      <section className="my-sessions-section">
        <div className="my-sessions-heading">
          <h2>Registered</h2>
          <Link to="/browse">Find sessions</Link>
        </div>

        {registered.length === 0 ? (
          <p className="empty-note">
            You haven't registered for any sessions yet.
          </p>
        ) : (
          <div className="session-list">
            {registered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MySessions;
