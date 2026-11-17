import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.js";
import SessionActions from "../components/SessionActions.jsx";
import "./SessionDetails.css";

export default function SessionDetails() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [sessions, authResponse] = await Promise.all([
        sessionsAPI.getSessions(),
        fetch(`${API_URL}/auth/login/success`, {
          credentials: "include",
        }),
      ]);

      console.log("Auth response status:", authResponse.status);

      const authData = authResponse.ok ? await authResponse.json() : null;

      console.log("Auth data:", authData);

      setUser(authData?.user ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading)
    return (
      <main className="session-details">
        <p>Loading...</p>
      </main>
    );
  if (error)
    return (
      <main className="session-details">
        <p>{error}</p>
      </main>
    );
  if (!session) {
    return (
      <main className="session-details">
        <h1>Session not found</h1>
        <Link to="/browse" className="details-back">
          ← Back to Browse Sessions
        </Link>
      </main>
    );
  }

  const spotsFilled = session.member_count;
  const percentFull = Math.min(100, (spotsFilled / session.max_members) * 100);
  const isCanceled = session.status === "Canceled";

  return (
    <main className="session-details">
      <Link to="/browse" className="details-back">
        ← Back to Browse Sessions
      </Link>

      <article className="details-card">
        <div className="details-header">
          <span className="details-subject">{session.subject_name}</span>
          <span
            className={`details-status ${isCanceled ? "canceled" : "active"}`}
          >
            {session.status}
          </span>
        </div>

        <h1>{session.title}</h1>
        <p className="details-host">Hosted by {session.host_name}</p>

        {session.description && (
          <p className="details-description">{session.description}</p>
        )}

        <dl className="details-meta">
          <div>
            <dt>Starts</dt>
            <dd>{new Date(session.start_time).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Ends</dt>
            <dd>{new Date(session.end_time).toLocaleString()}</dd>
          </div>
        </dl>

        <div className="details-attendance">
          <div className="attendance-label">
            <span>Attendees</span>
            <span>
              {spotsFilled}/{session.max_members}
            </span>
          </div>
          <div className="attendance-bar">
            <div
              className="attendance-fill"
              style={{ width: `${percentFull}%` }}
            />
          </div>
        </div>

        <SessionActions session={session} user={user} onChange={loadData} />
      </article>
    </main>
  );
}
