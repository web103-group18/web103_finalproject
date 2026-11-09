
import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/auth/login/success", {
      credentials: "include"
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch("/auth/logout", {
      credentials: "include"
    });
    setUser(null);
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/browse">Browse Sessions</Link>
      <Link to="/sessions/create">Create Session</Link>

      <div className="navbar-right">
        {user ? (
          <>
            <img
              className="avatar"
              src={user.avatar_url}
              alt=""
            />
            <span>{user.display_name}</span>
            <button onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <a className="login-button" href="/auth/github">
            Log in with GitHub
          </a>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
