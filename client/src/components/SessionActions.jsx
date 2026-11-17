import { useState } from "react";
import { Link } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.js";
import "./SessionActions.css";

export default function SessionActions({ session, user, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isHost = user && Number(user.id) === Number(session.host_id);
  const isCanceled = session.status === "Canceled";
  const isFull = session.member_count >= session.max_members;

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await onChange?.(); // refetch the session so the page updates
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = () => run(() => sessionsAPI.joinSession(session.id));

  const handleCancel = () => {
    if (
      !window.confirm("Cancel this session? Members will see it as canceled.")
    )
      return;
    run(() => sessionsAPI.cancelSession(session.id));
  };

  let actions;

  if (isCanceled) {
    actions = (
      <p className="session-actions-note">This session was canceled.</p>
    );
  } else if (!user) {
    actions = (
      <a className="action-button" href="/auth/github">
        Log in to register
      </a>
    );
  } else if (isHost) {
    actions = (
      <>
        <Link
          className="action-button secondary"
          to={`/sessions/${session.id}/edit`}
        >
          Edit Session
        </Link>
        <button
          className="action-button danger"
          onClick={handleCancel}
          disabled={busy}
        >
          {busy ? "Canceling..." : "Cancel Session"}
        </button>
      </>
    );
  } else if (session.joined) {
    actions = (
      <button className="action-button" disabled>
        You're registered
      </button>
    );
  } else {
    actions = (
      <button
        className="action-button"
        onClick={handleRegister}
        disabled={busy || isFull}
      >
        {isFull ? "Session full" : busy ? "Registering..." : "Register"}
      </button>
    );
  }

  return (
    <div className="session-actions">
      {actions}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
