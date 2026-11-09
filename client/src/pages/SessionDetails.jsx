
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.jsx";

export default function SessionDetails() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [sessions, authResponse] = await Promise.all([
          sessionsAPI.getSessions(),
          fetch("/auth/login/success", {
            credentials: "include"
          })
        ]);

        const authData = authResponse.ok
          ? await authResponse.json()
          : null;

        if (!active) return;

        const found = sessions.find(
          item => String(item.id) === String(id)
        );

        setSession(found || null);
        setUser(authData?.user ?? null);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <main><p>Loading...</p></main>;
  if (error) return <main><p>{error}</p></main>;
  if (!session) return <main><h1>Session not found</h1></main>;

  const isHost =
    user &&
    Number(user.id) === Number(session.host_id);

  return (
    <main className="container">
      <Link to="/browse">
        ← Back to Browse Sessions
      </Link>

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

      {isHost && (
        <div style={{ marginTop: "24px" }}>
          <Link
            to={`/sessions/${session.id}/edit`}
            style={{
              display: "inline-block",
              padding: "12px 22px",
              borderRadius: "10px",
              background: "#797ff4",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "700"
            }}
          >
            Edit Session
          </Link>
        </div>
      )}
    </main>
  );
}
