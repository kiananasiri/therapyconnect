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

  // Top navigation bar for all pages
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        background: "linear-gradient(90deg, #9E83B8 0%, #CCBBDB 100%)",
        boxShadow: "0 4px 20px rgba(158, 131, 184, 0.15)",
        marginBottom: "0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/" style={{ 
          textDecoration: "none", 
          color: "white", 
          fontWeight: "600",
          fontSize: "1.1rem",
          padding: "0.5rem 1rem",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease",
          fontFamily: "'Times New Roman', serif"
        }}
        onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
        onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
        >
          🏠 Home
        </Link>
        {user && (
          <>
            <Link to="/profile" style={{ 
              textDecoration: "none", 
              color: "white", 
              fontWeight: "500",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              fontFamily: "'Times New Roman', serif"
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              👤 Profile
            </Link>
            <Link to="/settings" style={{ 
              textDecoration: "none", 
              color: "white", 
              fontWeight: "500",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              transition: "all 0.3s ease",
              fontFamily: "'Times New Roman', serif"
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              ⚙️ Settings
            </Link>
            {user.role === "patient" ? (
              <Link to="/dashboard/patient" style={{ 
                textDecoration: "none", 
                color: "white", 
                fontWeight: "700",
                fontSize: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s ease",
                fontFamily: "'Times New Roman', serif"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
              >
                📊 Patient Dashboard
              </Link>
            ) : (
              <Link to="/dashboard/therapist" style={{ 
                textDecoration: "none", 
                color: "white", 
                fontWeight: "700",
                fontSize: "1rem",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.3s ease",
                fontFamily: "'Times New Roman', serif"
              }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
              >
                🏥 Therapist Dashboard
              </Link>
            )}
          </>
        )}
      </div>
      <div>
        {user ? (
          <button 
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Times New Roman', serif"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 100, 100, 0.2)";
              e.target.style.borderColor = "rgba(255, 100, 100, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            🚪 Logout
          </button>
        ) : (
          <Link to="/?auth=patient">
            <button style={{
              padding: "0.5rem 1rem",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.9)",
              border: "none",
              color: "#758976",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Times New Roman', serif"
            }}
            onMouseEnter={(e) => e.target.style.background = "white"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.9)"}
            >
              🔐 Login / Signup
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}

