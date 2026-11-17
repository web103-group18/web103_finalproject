import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const API_URL = "https://server-0fb4.onrender.com";
  useEffect(() => {
    fetch(`${API_URL}/auth/login/success`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="home">
        📚 StudyCircle
      </Link>
      <div className="navbar-links">
        <Link to="/browse">Browse Sessions</Link>
        {user && <Link to="/my-sessions">My Sessions</Link>}
        <Link to="/sessions/create">Create Session</Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <img className="avatar" src={user.avatar_url} alt="" />
            <span>{user.display_name}</span>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <a className="login-button" href={`${API_URL}/auth/github`}>
            Log in with GitHub
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
