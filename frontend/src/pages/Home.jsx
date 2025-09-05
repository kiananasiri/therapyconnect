import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // In future: pass search query via state or query params
    navigate("/therapists");
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to TherapyConnect</h1>
      <p>Find the right therapist for you, book sessions, and manage appointments.</p>

      <div style={{ margin: "1.5rem 0" }}>
        <Link to="/auth">
          <button style={{ margin: "0.5rem", padding: "0.75rem 1.5rem" }}>
            Login / Signup
          </button>
        </Link>
      </div>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search therapists by name or specialty"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", width: "60%", marginRight: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Search
        </button>
      </form>
    </div>
  );
}

