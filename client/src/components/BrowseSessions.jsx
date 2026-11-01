import placeholderSessions from "../data/placeholderSessions.js"
import './BrowseSessions.css'

const BrowseSessions = () => {
  return (
    <main className="browse">
      <h1>Browse Sessions</h1>

      <div className="session-list">
        {placeholderSessions.map((session) => (
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
