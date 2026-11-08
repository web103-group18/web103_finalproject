
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.jsx";
import "./BrowseSessions.css";

const BrowseSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("earliest");

  useEffect(() => {
    sessionsAPI.getSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(
    () => [...new Set(sessions.map(s => s.subject_name))].sort(),
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    return sessions
      .filter(session => {
        const query = search.toLowerCase().trim();

        const matchesSearch =
          session.title.toLowerCase().includes(query) ||
          session.subject_name.toLowerCase().includes(query) ||
          (session.description || "").toLowerCase().includes(query);

        const matchesSubject =
          subject === "all" || session.subject_name === subject;

        return matchesSearch && matchesSubject;
      })
      .sort((a, b) =>
        sort === "earliest"
          ? new Date(a.start_time) - new Date(b.start_time)
          : new Date(b.start_time) - new Date(a.start_time)
      );
  }, [sessions, search, subject, sort]);

  return (
    <main className="browse">
      <h1>Browse Sessions</h1>

      <div className="session-filters">
        <input
          type="search"
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search sessions"
        />

        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="Filter by subject"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort sessions"
        >
          <option value="earliest">Earliest First</option>
          <option value="latest">Latest First</option>
        </select>
      </div>

      {loading && <p>Loading sessions...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && filteredSessions.length === 0 && (
        <p>No matching study sessions found.</p>
      )}

      <div className="session-list">
        {filteredSessions.map(session => (
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

            <Link to={`/sessions/${session.id}`}>
              View Details
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
};

export default BrowseSessions;

