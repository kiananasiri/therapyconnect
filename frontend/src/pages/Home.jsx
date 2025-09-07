import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTherapists } from "../api";
import { useUser } from "../contexts/UserContext";
import avatar from "../assets/avatar.png";

export default function Home() {
  const [search, setSearch] = useState("");
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTherapistSignIn, setShowTherapistSignIn] = useState(false);
  const [therapistAuth, setTherapistAuth] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { setUser } = useUser();

  // Fetch therapists on component mount
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await getTherapists();
        setTherapists(response.data || []);
      } catch (error) {
        console.error('Error fetching therapists:', error);
        // Fallback to mock data
        setTherapists([
          {
            id: "t_abc123",
            first_name: "Dr. Alice",
            last_name: "Smith",
            area_of_expertise: ["Cognitive Therapy", "Anxiety"],
            about_note: "Specializing in cognitive behavioral therapy with 10+ years experience.",
            average_score: 4.8,
            profile_picture: null
          },
          {
            id: "t_def456",
            first_name: "Dr. John",
            last_name: "Doe",
            area_of_expertise: ["Family Therapy", "Couples Counseling"],
            about_note: "Expert in family dynamics and relationship counseling.",
            average_score: 4.6,
            profile_picture: null
          },
          {
            id: "t_ghi789",
            first_name: "Dr. Sarah",
            last_name: "Johnson",
            area_of_expertise: ["Depression", "Trauma Therapy"],
            about_note: "Compassionate care for depression and trauma recovery.",
            average_score: 4.9,
            profile_picture: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // In future: pass search query via state or query params
    navigate("/therapists");
  };

  const handleTherapistSignIn = (e) => {
    e.preventDefault();
    if (!therapistAuth.email || !therapistAuth.password) {
      alert("Please enter email and password");
      return;
    }

    // Mock authentication - in real app, this would call an API
    setUser({ 
      role: "therapist", 
      name: therapistAuth.email,
      id: "t_abc123" // Mock therapist ID
    });
    navigate("/dashboard/therapist");
  };

  const handleTherapistAuthChange = (e) => {
    setTherapistAuth({ 
      ...therapistAuth, 
      [e.target.name]: e.target.value 
    });
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Hero Section */}
      <div style={{ textAlign: "center", color: "white", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "3rem", margin: "0 0 1rem 0", fontWeight: "300" }}>
          Welcome to TherapyConnect
        </h1>
        <p style={{ fontSize: "1.2rem", margin: "0 0 2rem 0", opacity: "0.9" }}>
          Find the right therapist for you, book sessions, and manage appointments.
        </p>

        {/* User Actions */}
        <div style={{ margin: "2rem 0" }}>
          <Link to="/auth">
            <button style={{ 
              margin: "0.5rem", 
              padding: "1rem 2rem",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid white",
              color: "white",
              borderRadius: "50px",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s"
            }}>
              Patient Login / Signup
            </button>
          </Link>
        </div>

        {/* Search Section */}
        <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            placeholder="Search therapists by name or specialty"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              padding: "1rem", 
              width: "400px", 
              marginRight: "1rem",
              borderRadius: "50px",
              border: "none",
              fontSize: "1rem"
            }}
          />
          <button type="submit" style={{ 
            padding: "1rem 2rem",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "50px",
            fontSize: "1rem",
            cursor: "pointer"
          }}>
            Search
          </button>
        </form>
      </div>

      {/* Main Content Container */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "2rem",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* Left Side: Therapist Cards */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <h2 style={{ 
            textAlign: "center", 
            color: "#333", 
            marginBottom: "2rem",
            fontSize: "2rem",
            fontWeight: "300"
          }}>
            Our Therapists
          </h2>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{
                width: "50px",
                height: "50px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #667eea",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto"
              }}></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Loading therapists...</p>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
              gap: "1.5rem" 
            }}>
              {therapists.slice(0, 6).map((therapist) => (
                <div
                  key={therapist.id}
                  style={{
                    background: "white",
                    borderRadius: "15px",
                    padding: "1.5rem",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-5px)";
                    e.target.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                  }}
                  onClick={() => navigate(`/therapists/${therapist.id}`)}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                    <img
                      src={therapist.profile_picture || avatar}
                      alt={`${therapist.first_name} ${therapist.last_name}`}
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "1rem"
                      }}
                    />
                    <div>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
                        {therapist.first_name} {therapist.last_name}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ color: "#FFD700", marginRight: "0.5rem" }}>★</span>
                        <span style={{ color: "#666", fontSize: "0.9rem" }}>
                          {therapist.average_score || "4.5"}/5.0
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ 
                    color: "#666", 
                    fontSize: "0.9rem", 
                    marginBottom: "1rem",
                    lineHeight: "1.4"
                  }}>
                    {therapist.about_note || "Professional therapist with years of experience."}
                  </p>
                  
                  <div style={{ marginBottom: "1rem" }}>
                    {therapist.area_of_expertise && therapist.area_of_expertise.slice(0, 3).map((expertise, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          background: "#e3f2fd",
                          color: "#1976d2",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          margin: "0.25rem 0.25rem 0 0"
                        }}
                      >
                        {expertise}
                      </span>
                    ))}
                  </div>
                  
                  <button style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "background 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#5a6fd8"}
                  onMouseLeave={(e) => e.target.style.background = "#667eea"}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}

          {therapists.length > 6 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link to="/therapists">
                <button style={{
                  padding: "1rem 2rem",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  fontSize: "1rem",
                  cursor: "pointer"
                }}>
                  View All Therapists
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Therapist Sign In */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          height: "fit-content"
        }}>
          <h2 style={{ 
            textAlign: "center", 
            color: "#333", 
            marginBottom: "1.5rem",
            fontSize: "1.5rem",
            fontWeight: "300"
          }}>
            Therapist Portal
          </h2>
          
          {!showTherapistSignIn ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#666", marginBottom: "1.5rem", lineHeight: "1.5" }}>
                Are you a therapist? Access your dashboard to manage appointments, 
                view patients, and track your schedule.
              </p>
              <button
                onClick={() => setShowTherapistSignIn(true)}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "#764ba2",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.3s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#6a4190"}
                onMouseLeave={(e) => e.target.style.background = "#764ba2"}
              >
                Therapist Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleTherapistSignIn}>
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={therapistAuth.email}
                  onChange={handleTherapistAuthChange}
                  required
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={therapistAuth.password}
                  onChange={handleTherapistAuthChange}
                  required
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  marginBottom: "1rem",
                  transition: "background 0.3s"
                }}
                onMouseEnter={(e) => e.target.style.background = "#45a049"}
                onMouseLeave={(e) => e.target.style.background = "#4CAF50"}
              >
                Sign In
              </button>
              
              <button
                type="button"
                onClick={() => setShowTherapistSignIn(false)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "transparent",
                  color: "#666",
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                Back
              </button>
            </form>
          )}
          
          <div style={{ 
            marginTop: "2rem", 
            padding: "1rem", 
            background: "#f8f9fa", 
            borderRadius: "10px",
            border: "1px solid #e9ecef"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057", fontSize: "0.9rem" }}>
              Demo Credentials:
            </h4>
            <p style={{ margin: "0", color: "#6c757d", fontSize: "0.8rem" }}>
              Email: demo@therapist.com<br/>
              Password: demo123
            </p>
          </div>
        </div>
      </div>

      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

