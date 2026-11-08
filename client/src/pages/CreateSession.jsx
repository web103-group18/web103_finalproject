
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import sessionsAPI from "../services/SessionsAPI.jsx";
import subjectsAPI from "../services/SubjectsAPI.jsx";
import "./CreateSession.css";

export default function CreateSession() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [user, setUser] = useState(null);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [loading, setLoading] = useState(false);
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
    subjectsAPI.getSubjects()
      .then(setSubjects)
      .catch(() => setError("Unable to load subjects."));

    fetch("/auth/login/success", {
      credentials: "include"
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setCheckingLogin(false));
  }, []);

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

    setLoading(true);

    try {
      const session = await sessionsAPI.createSession({
        title: form.title.trim(),
        subject_id: Number(form.subject_id),
        description: form.description.trim(),
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        max_members: Number(form.max_members)
      });

      navigate(`/sessions/${session.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-session">
      <div className="create-session-card">
        <Link to="/browse" className="back-link">
          ← Back to Browse Sessions
        </Link>

        <h1>Create a Study Session</h1>
        <p className="intro">
          Bring students together and make studying easier.
        </p>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {!checkingLogin && !user && (
          <div className="login-notice">
            <p>Log in with GitHub to create a session.</p>
            <a href="/auth/github" className="github-login">
              Log in with GitHub
            </a>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Session Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Calculus Exam Review"
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
              <option key={subject.id} value={subject.id}>
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
            placeholder="What will everyone study?"
            rows={4}
          />

          <div className="form-row">
            <div>
              <label htmlFor="start_time">Start Time</label>
              <input
                id="start_time"
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="end_time">End Time</label>
              <input
                id="end_time"
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <label htmlFor="max_members">Maximum Attendees</label>
          <input
            id="max_members"
            type="number"
            name="max_members"
            min="1"
            max="100"
            value={form.max_members}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            disabled={loading || checkingLogin || !user}
          >
            {loading ? "Creating Session..." : "Create Session"}
          </button>
        </form>
      </div>
    </main>
  );
}
