
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.jsx";
import subjectsAPI from "../services/SubjectsAPI.jsx";
import "./CreateSession.css";

const toLocalDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
};

export default function EditSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subject_id: "",
    description: "",
    start_time: "",
    end_time: "",
    max_members: 6
  });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [sessions, subjectList, authResponse] =
          await Promise.all([
            sessionsAPI.getSessions(),
            subjectsAPI.getSubjects(),
            fetch("/auth/login/success", {
              credentials: "include"
            })
          ]);

        const authData = authResponse.ok
          ? await authResponse.json()
          : null;

        const currentUser = authData?.user ?? null;
        const found = sessions.find(
          item => String(item.id) === String(id)
        );

        if (!active) return;

        setSubjects(subjectList);
        setUser(currentUser);
        setSession(found || null);

        if (found) {
          setForm({
            title: found.title || "",
            subject_id: String(found.subject_id),
            description: found.description || "",
            start_time: toLocalDateTime(found.start_time),
            end_time: toLocalDateTime(found.end_time),
            max_members: found.max_members
          });
        }
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

  const isHost =
    user &&
    session &&
    Number(user.id) === Number(session.host_id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isHost) {
      setError("Only the session host can edit this session.");
      return;
    }

    const start = new Date(form.start_time);
    const end = new Date(form.end_time);

    if (start <= new Date()) {
      setError("Start time must be in the future.");
      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);

    try {
      await sessionsAPI.updateSession(id, {
        title: form.title.trim(),
        subject_id: Number(form.subject_id),
        description: form.description.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        max_members: Number(form.max_members)
      });

      navigate(`/sessions/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="create-session">
        <p>Loading session...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="create-session">
        <h1>Session not found</h1>
        {error && <p className="form-error">{error}</p>}
        <Link to="/browse">Back to Browse Sessions</Link>
      </main>
    );
  }

  if (!user || !isHost) {
    return (
      <main className="create-session">
        <div className="create-session-card">
          <h1>Access Denied</h1>
          <p>Only the host can edit this session.</p>
          <Link to={`/sessions/${id}`}>
            Back to Session Details
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="create-session">
      <div className="create-session-card">
        <Link
          to={`/sessions/${id}`}
          className="back-link"
        >
          ← Back to Session Details
        </Link>

        <h1>Edit Study Session</h1>

        <p className="intro">
          Update your study session information.
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Session Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            required
          />

          <label htmlFor="subject_id">Subject</label>
          <select
            id="subject_id"
            name="subject_id"
            value={form.subject_id}
            onChange={handleChange}
            required
          >
            <option value="">Choose a subject</option>
            {subjects.map(subject => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            ))}
          </select>

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />

          <div className="form-row">
            <div>
              <label htmlFor="start_time">
                Start Time
              </label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="end_time">
                End Time
              </label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="max_members">
            Maximum Attendees
          </label>
          <input
            id="max_members"
            name="max_members"
            type="number"
            min={Math.max(1, session.member_count)}
            max={100}
            value={form.max_members}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}
