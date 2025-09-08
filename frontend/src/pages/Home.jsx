import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTherapists, therapistLogin, patientLogin, patientCreate, checkPatientUnique } from "../api";
import { useUser } from "../contexts/UserContext";
import avatar from "../assets/avatar.png";

// Helper to persist patient user in localStorage (align with therapist handling)
const storeUser = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (_) {}
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTherapistSignIn, setShowTherapistSignIn] = useState(false);
  const [showPatientAuth, setShowPatientAuth] = useState(false);
  const [patientMode, setPatientMode] = useState("login"); // 'login' | 'signup'
  // Login: identifier (email or phone), password
  // Signup: first_name, last_name, phone_no, email, password
  const [patientAuth, setPatientAuth] = useState({ identifier: "", password: "", first_name: "", last_name: "", phone_no: "", email: "" });
  const [patientError, setPatientError] = useState("");
  const [patientLoading, setPatientLoading] = useState(false);
  const [showPatientDetailsModal, setShowPatientDetailsModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    // Required fields in Patient model
    password: "",
    first_name: "",
    last_name: "",
    phone_no: "",
    email: "",
    address: "",
    added_note: "",
    allergies_and_medication: "",
    date_of_birth: "",
    sex: "",
    about_note: ""
  });
  const [patientDetailsError, setPatientDetailsError] = useState("");
  const [patientDetailsLoading, setPatientDetailsLoading] = useState(false);
  const [therapistAuth, setTherapistAuth] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUser();

  // Fetch therapists on component mount
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        console.log('🔄 Fetching therapists from API...');
        const response = await getTherapists();
        console.log('✅ API Response:', response);
        console.log('📊 Therapists data:', response.data);
        
        if (response.data && response.data.length > 0) {
          setTherapists(response.data);
          console.log(`✅ Successfully loaded ${response.data.length} therapists from database`);
        } else {
          console.log('⚠️ No therapists found in database, using fallback data');
          // Only use fallback if no data from API
          setTherapists([
            {
              id: "t_abc123",
              first_name: "Dr. Alice",
              last_name: "Smith",
              area_of_expertise: ["Cognitive Therapy", "Anxiety"],
              about_note: "Specializing in cognitive behavioral therapy with 10+ years experience.",
              average_score: 4.8,
              profile_picture: null
            }
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching therapists:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Fallback to mock data only on error
        console.log('🔄 Using fallback mock data due to API error');
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

  const handleTherapistSignIn = async (e) => {
    e.preventDefault();
    if (!therapistAuth.email || !therapistAuth.password) {
      setLoginError("Please enter email and password");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      console.log('🔍 Attempting login with:', { 
        email: therapistAuth.email, 
        password: therapistAuth.password,
        apiUrl: 'http://localhost:8000/api/therapist-login/'
      });
      
      const response = await therapistLogin(therapistAuth.email, therapistAuth.password);
      console.log('✅ Login successful:', response);
      
      // Login successful
      const therapist = response.data.therapist;
      console.log('👨‍⚕️ Therapist data:', therapist);
      
      setUser({ 
        role: "therapist", 
        name: therapist.full_name,
        email: therapist.email,
        id: therapist.id
      });
      navigate("/dashboard/therapist");
      
    } catch (error) {
      console.error('❌ Login error full details:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.response?.data?.error || `Login failed: ${error.message}`;
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTherapistAuthChange = (e) => {
    setTherapistAuth({ 
      ...therapistAuth, 
      [e.target.name]: e.target.value 
    });
  };
  const handlePatientAuthChange = (e) => {
    setPatientAuth({ ...patientAuth, [e.target.name]: e.target.value });
  };
  const handlePatientDetailsChange = (e) => {
    setPatientDetails({ ...patientDetails, [e.target.name]: e.target.value });
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientError("");
    if (patientMode === "signup") {
      if (!patientAuth.first_name || !patientAuth.last_name || !patientAuth.phone_no || !patientAuth.email || !patientAuth.password) {
        setPatientError("Please fill all required fields");
        return;
      }
      try {
        setPatientLoading(true);
        // Check uniqueness for phone and email
        const { phoneExists, emailExists } = await checkPatientUnique({ phone_no: patientAuth.phone_no, email: patientAuth.email });
        if (phoneExists || emailExists) {
          setPatientError(phoneExists ? "Phone number already in use. Please login instead or use a different phone number." : "Email already in use. Please login instead or use a different email.");
          return;
        }
        // If phone not already in database -> open second step to complete profile
        setShowPatientAuth(false);
        setPatientDetailsError("");
        // Prefill details from step 1
        const prefill = {
          password: patientAuth.password,
          first_name: patientAuth.first_name,
          last_name: patientAuth.last_name,
          phone_no: patientAuth.phone_no,
          email: patientAuth.email,
          address: "",
          added_note: "",
          allergies_and_medication: "",
          date_of_birth: "",
          sex: "",
          about_note: ""
        };
        setPatientDetails(prefill);
        setShowPatientDetailsModal(true);
      } catch (error) {
        const msg = error.response?.data?.error || error.message || "Failed to validate";
        setPatientError(msg);
      } finally {
        setPatientLoading(false);
      }
      return;
    }

    // Login flow
    if (!patientAuth.identifier || !patientAuth.password) {
      setPatientError("Please enter email or phone and password");
      return;
    }
    try {
      setPatientLoading(true);
      const resp = await patientLogin(patientAuth.identifier, patientAuth.password);
      const userPayload = resp.data.patient || {};
      setUser({ role: "patient", name: userPayload.full_name || `${userPayload.first_name} ${userPayload.last_name}`, id: userPayload.id, email: userPayload.email, phone_no: userPayload.phone_no });
      storeUser({ ...userPayload, role: "patient" });
      setShowPatientAuth(false);
      setPatientAuth({ identifier: "", password: "", first_name: "", last_name: "", phone_no: "" });
      navigate("/dashboard/patient");
    } catch (error) {
      const msg = error.response?.data?.error || error.response?.data?.detail || error.message || "Authentication failed";
      setPatientError(msg);
    } finally {
      setPatientLoading(false);
    }
  };

  const handlePatientDetailsSubmit = async (e) => {
    e.preventDefault();
    setPatientDetailsError("");
    // Required: password, first_name, last_name, phone_no, email, allergies_and_medication, date_of_birth, sex
    const required = ["password","first_name","last_name","phone_no","email","allergies_and_medication","date_of_birth","sex"];
    const missing = required.filter((k) => !patientDetails[k]);
    if (missing.length) {
      setPatientDetailsError("Please fill all required fields");
      return;
    }
    try {
      setPatientDetailsLoading(true);
      // Create patient
      const createResp = await patientCreate(patientDetails);
      const patient = createResp.data;
      // Auto login using phone_no + password to get tokens
      await patientLogin(patient.phone_no, patientDetails.password);
      setUser({ role: "patient", name: `${patient.first_name} ${patient.last_name}`, id: patient.id, email: patient.email, phone_no: patient.phone_no });
      storeUser({ ...patient, role: "patient" });
      setShowPatientDetailsModal(false);
      navigate("/dashboard/patient");
    } catch (error) {
      const msg = error.response?.data?.error || (error.response?.data && JSON.stringify(error.response.data)) || error.message || "Signup failed";
      setPatientDetailsError(msg);
    } finally {
      setPatientDetailsLoading(false);
    }
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
        <div style={{ margin: "2rem 0", display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
          <button 
            onClick={() => {
              setShowPatientAuth(true);
              setPatientMode("login");
            }}
            style={{ 
              padding: "1rem 2rem",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid white",
              color: "white",
              borderRadius: "50px",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            👤 Patient Login
          </button>
          
          <button 
            onClick={() => setShowTherapistSignIn(true)}
            style={{ 
              padding: "1rem 2rem",
              background: "rgba(76, 175, 80, 0.8)",
              border: "2px solid #4CAF50",
              color: "white",
              borderRadius: "50px",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(76, 175, 80, 1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(76, 175, 80, 0.8)";
            }}
          >
            🩺 Therapist Login
          </button>
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

      {/* Therapist Login Modal */}
      {showTherapistSignIn && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTherapistSignIn(false);
              setLoginError("");
              setTherapistAuth({ email: "", password: "" });
            }
          }}
        >
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "400px",
            maxWidth: "90%"
          }}>
            <h2 style={{ 
              textAlign: "center", 
              color: "#333", 
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
              fontWeight: "300"
            }}>
              🩺 Therapist Login
            </h2>
            
            <form onSubmit={handleTherapistSignIn}>
              {loginError && (
                <div style={{
                  background: "#ffebee",
                  color: "#c62828",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  border: "1px solid #ffcdd2"
                }}>
                  {loginError}
                </div>
              )}
              
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={therapistAuth.email}
                  onChange={handleTherapistAuthChange}
                  required
                  disabled={loginLoading}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    opacity: loginLoading ? 0.7 : 1
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
                  disabled={loginLoading}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    opacity: loginLoading ? 0.7 : 1
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: loginLoading ? "#ccc" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  cursor: loginLoading ? "not-allowed" : "pointer",
                  marginBottom: "1rem",
                  transition: "background 0.3s",
                  opacity: loginLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loginLoading) e.target.style.background = "#45a049";
                }}
                onMouseLeave={(e) => {
                  if (!loginLoading) e.target.style.background = "#4CAF50";
                }}
              >
                {loginLoading ? "Signing In..." : "Sign In"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowTherapistSignIn(false);
                  setLoginError("");
                  setTherapistAuth({ email: "", password: "" });
                }}
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
                Cancel
              </button>
            </form>
            
            <div style={{ 
              marginTop: "1.5rem", 
              padding: "1rem", 
              background: "#f8f9fa", 
              borderRadius: "10px",
              border: "1px solid #e9ecef"
            }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057", fontSize: "0.9rem" }}>
                Test Credentials:
              </h4>
              <p style={{ margin: "0", color: "#6c757d", fontSize: "0.8rem" }}>
                Email: alice.smith@therapyconnect.com<br/>
                Password: password123
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Auth Modal */}
      {showPatientAuth && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPatientAuth(false);
              setPatientError("");
              setPatientAuth({ identifier: "", password: "", first_name: "", last_name: "", phone_no: "" });
            }
          }}
        >
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "420px",
            maxWidth: "90%"
          }}>
            <h2 style={{ 
              textAlign: "center", 
              color: "#333", 
              marginBottom: "1rem",
              fontSize: "1.5rem",
              fontWeight: "300"
            }}>
              👤 Patient {patientMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>

            <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => { setPatientMode("login"); setPatientError(""); }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: patientMode === 'login' ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                  background: patientMode === 'login' ? '#e8f5e8' : 'white',
                  color: '#2E7D32',
                  cursor: 'pointer'
                }}
              >Login</button>
              <button
                type="button"
                onClick={() => { setPatientMode("signup"); setPatientError(""); }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: patientMode === 'signup' ? '2px solid #4CAF50' : '1px solid #e0e0e0',
                  background: patientMode === 'signup' ? '#e8f5e8' : 'white',
                  color: '#2E7D32',
                  cursor: 'pointer'
                }}
              >Sign Up</button>
            </div>

            <form onSubmit={handlePatientSubmit}>
              {patientError && (
                <div style={{
                  background: "#ffebee",
                  color: "#c62828",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  border: "1px solid #ffcdd2"
                }}>
                  {patientError}
                </div>
              )}

              {patientMode === 'login' ? (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Email or Phone <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="text"
                      name="identifier"
                      placeholder="Email or Phone Number"
                      value={patientAuth.identifier}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Password <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={patientAuth.password}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>First Name <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="text"
                      name="first_name"
                      placeholder="First Name"
                      value={patientAuth.first_name}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Last Name <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Last Name"
                      value={patientAuth.last_name}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Phone Number <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="text"
                      name="phone_no"
                      placeholder="Phone Number"
                      value={patientAuth.phone_no}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Email <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={patientAuth.email}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Password <span style={{ color: "#d32f2f" }}>*</span></div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={patientAuth.password}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "10px",
                        fontSize: "1rem",
                        boxSizing: "border-box",
                        opacity: patientLoading ? 0.7 : 1
                      }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={patientLoading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: patientLoading ? "#ccc" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  cursor: patientLoading ? "not-allowed" : "pointer",
                  marginBottom: "1rem",
                  transition: "background 0.3s",
                  opacity: patientLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!patientLoading) e.target.style.background = "#5a6fd8";
                }}
                onMouseLeave={(e) => {
                  if (!patientLoading) e.target.style.background = "#667eea";
                }}
              >
                {patientLoading ? (patientMode === 'login' ? 'Logging In...' : 'Signing Up...') : (patientMode === 'login' ? 'Login' : 'Sign Up')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPatientAuth(false);
                  setPatientError("");
                  setPatientAuth({ identifier: "", password: "", first_name: "", last_name: "", phone_no: "" });
                }}
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
                Cancel
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem" }}>
                <button
                  type="button"
                  onClick={() => { setPatientMode(patientMode === 'login' ? 'signup' : 'login'); setPatientError(""); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer'
                  }}
                >
                  {patientMode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Patient Details Second Step Modal */}
      {showPatientDetailsModal && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPatientDetailsModal(false);
            }
          }}
        >
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "560px",
            maxWidth: "95%"
          }}>
            <h2 style={{ textAlign: "center", color: "#333", marginBottom: "1rem", fontSize: "1.5rem", fontWeight: "300" }}>
              👤 Complete Patient Profile
            </h2>
            {patientDetailsError && (
              <div style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                border: "1px solid #ffcdd2"
              }}>
                {patientDetailsError}
              </div>
            )}
            <form onSubmit={handlePatientDetailsSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>First Name <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="first_name" placeholder="First Name" value={patientDetails.first_name} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Last Name <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="last_name" placeholder="Last Name" value={patientDetails.last_name} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Phone Number <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="phone_no" placeholder="Phone Number" value={patientDetails.phone_no} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Email <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="email" placeholder="Email" type="email" value={patientDetails.email || ""} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Date of Birth <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="date_of_birth" placeholder="Date of Birth" type="date" value={patientDetails.date_of_birth} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Sex <span style={{ color: "#d32f2f" }}>*</span></div>
                  <select name="sex" value={patientDetails.sex} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }}>
                    <option value="">Select Sex</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                    <option value="P">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: "0.5rem", color: "#555", fontSize: "0.9rem" }}>If nothing applies, type 'none'.</div>
              <div style={{ marginTop: "0.25rem", marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Allergies and Medication <span style={{ color: "#d32f2f" }}>*</span></div>
              <textarea name="allergies_and_medication" placeholder="Allergies and Medication (required)" value={patientDetails.allergies_and_medication} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ marginTop: "0.25rem", width: "100%", minHeight: "80px", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
              <textarea name="address" placeholder="Address (optional)" value={patientDetails.address || ""} onChange={handlePatientDetailsChange} disabled={patientDetailsLoading} style={{ marginTop: "0.75rem", width: "100%", minHeight: "60px", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
              <textarea name="about_note" placeholder="About (optional)" value={patientDetails.about_note || ""} onChange={handlePatientDetailsChange} disabled={patientDetailsLoading} style={{ marginTop: "0.75rem", width: "100%", minHeight: "60px", padding: "0.75rem", border: "1px solid #e0e0e0", borderRadius: "8px" }} />
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit" disabled={patientDetailsLoading} style={{ flex: 1, padding: "0.9rem", background: patientDetailsLoading ? "#ccc" : "#667eea", color: "white", border: "none", borderRadius: "10px", cursor: patientDetailsLoading ? "not-allowed" : "pointer" }}>
                  {patientDetailsLoading ? "Creating..." : "Create Account"}
                </button>
                <button type="button" onClick={() => setShowPatientDetailsModal(false)} disabled={patientDetailsLoading} style={{ padding: "0.9rem 1rem", background: "transparent", color: "#666", border: "1px solid #e0e0e0", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Therapist Cards */}
        <div style={{
          background: "rgba(255,255,255,0.95)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          width: "100%"
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

