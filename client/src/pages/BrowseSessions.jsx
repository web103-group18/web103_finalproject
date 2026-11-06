import { useEffect, useState } from "react"
import sessionsAPI from "../services/SessionsAPI.jsx"
import './BrowseSessions.css'

const BrowseSessions = () => {
  const [sessions, setSessions] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    sessionsAPI.getSessions().then(setSessions).catch((err) => setError(err.message))
  }, [])

  return (
    <main className="browse">
      <h1>Browse Sessions</h1>

      <div className="session-list">
        {sessions.map((session) => (
          <article key={session.id} className="session-card">
            <h2>{session.title}</h2>
            <p className="subject">{session.subject_name}</p>
            <p>Hosted by {session.host_name}</p>
            <p>{session.description}</p>
            <p>{session.location}</p>
            <p>
              {new Date(session.start_time).toLocaleString()} to{" "}
              {new Date(session.end_time).toLocaleTimeString()}
            </p>
            <p>
              {session.member_count}/{session.max_members} spots filled
            </p>
            {session.status === "canceled" && (
              <span className="tag">Canceled</span>
            )}
          </article>
        ))}
      </div>
    </main>
  );
};

export default BrowseSessions;
