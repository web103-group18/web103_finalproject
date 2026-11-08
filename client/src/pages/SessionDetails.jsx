
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.jsx";

export default function SessionDetails() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    sessionsAPI.getSessions()
      .then((sessions) => {
        if (active) {
          const found = sessions.find(
            (item) => String(item.id) === id
          );
          setSession(found || null);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  if (loading) return <main><p>Loading...</p></main>;
  if (error) return <main><p>{error}</p></main>;
  if (!session) return <main><h1>Session not found</h1></main>;

  return (
    <main className="container">
      <Link to="/browse">← Back to Browse Sessions</Link>

      <h1>{session.title}</h1>
      <p><strong>Subject:</strong> {session.subject_name}</p>
      <p><strong>Host:</strong> {session.host_name}</p>
      <p><strong>Description:</strong> {session.description}</p>
      <p>
        <strong>Start:</strong>{" "}
        {new Date(session.start_time).toLocaleString()}
      </p>
      <p>
        <strong>End:</strong>{" "}
        {new Date(session.end_time).toLocaleString()}
      </p>
      <p>
        <strong>Attendees:</strong>{" "}
        {session.member_count}/{session.max_members}
      </p>
      <p><strong>Status:</strong> {session.status}</p>
    </main>
  );
}
