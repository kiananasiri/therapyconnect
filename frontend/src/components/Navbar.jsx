import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function Navbar() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "#f0f0f0",
        marginBottom: "1.5rem",
      }}
    >
      <div>
        <Link to="/" style={{ marginRight: "1rem" }}>
          Home
        </Link>
        {user && (
          <>
            <Link to="/profile" style={{ marginRight: "1rem" }}>
              Profile
            </Link>
            <Link to="/settings" style={{ marginRight: "1rem" }}>
              Settings
            </Link>
            {user.role === "patient" ? (
              <Link to="/dashboard/patient" style={{ marginRight: "1rem" }}>
                Patient Dashboard
              </Link>
            ) : (
              <Link to="/dashboard/therapist" style={{ marginRight: "1rem" }}>
                Therapist Dashboard
              </Link>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/auth">
            <button>Login / Signup</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

