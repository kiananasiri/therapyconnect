import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTherapists, therapistLogin, patientLogin, patientCreate, checkPatientUnique } from "../api";
import { useUser } from "../contexts/UserContext";
import avatar from "../assets/avatar.png";
import helpGif from "../assets/Mtv Help Sticker by INTO ACTION.gif";
import flowersGif from "../assets/Mental Health Flowers Sticker by mtv.gif";

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
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showTherapistSignIn, setShowTherapistSignIn] = useState(false);
  const [showPatientAuth, setShowPatientAuth] = useState(false);
  const [patientMode, setPatientMode] = useState("login"); // 'login' | 'signup'
  const [showTherapistPassword, setShowTherapistPassword] = useState(false);
  const [showPatientLoginPassword, setShowPatientLoginPassword] = useState(false);
  const [showPatientSignupPassword, setShowPatientSignupPassword] = useState(false);
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
  const [currentSlide, setCurrentSlide] = useState(0); // 0: text, 1: helpGif, 2: flowersGif
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
    
    // Listen for login popup trigger from navbar
    const handleShowLoginPopup = () => setShowLoginPopup(true);
    window.addEventListener('showLoginPopup', handleShowLoginPopup);
    
    return () => {
      window.removeEventListener('showLoginPopup', handleShowLoginPopup);
    };
  }, []);

  // Slideshow effect for hero section
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3); // Cycle through 0, 1, 2
    }, 8000); // Switch every 8 seconds

    return () => clearInterval(slideInterval);
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
      // Trim values
      const firstName = (patientAuth.first_name || "").trim();
      const lastName = (patientAuth.last_name || "").trim();
      const phoneRaw = (patientAuth.phone_no || "").trim();
      const email = (patientAuth.email || "").trim();
      const password = patientAuth.password || "";

      if (!firstName || !lastName || !phoneRaw || !email || !password) {
        setPatientError("Please fill all required fields");
        return;
      }

      // Basic validations
      const nameRegex = /^[A-Za-z][A-Za-z'\-\s]{1,49}$/; // 2-50 chars letters, space, hyphen, apostrophe
      if (!nameRegex.test(firstName)) {
        setPatientError("Please enter a valid first name (letters only, 2-50 chars)");
        return;
      }
      if (!nameRegex.test(lastName)) {
        setPatientError("Please enter a valid last name (letters only, 2-50 chars)");
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        setPatientError("Please enter a valid email address");
        return;
      }
      const digitsOnly = phoneRaw.replace(/\D/g, "");
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        setPatientError("Please enter a valid phone number (10-15 digits)");
        return;
      }
      if (password.length < 8) {
        setPatientError("Password must be at least 8 characters long");
        return;
      }
      try {
        setPatientLoading(true);
        // Check uniqueness for phone and email
        const { phoneExists, emailExists } = await checkPatientUnique({ phone_no: digitsOnly, email });
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
          first_name: firstName,
          last_name: lastName,
          phone_no: digitsOnly,
          email,
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
    <>
      <style>
        {`
          @keyframes gradientSlide {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(50px);
            }
          }
          .slide-content {
            animation: slideIn 0.8s ease-out;
          }
        `}
      </style>
      <div style={{ 
        padding: "0", 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #F8E8FF 0%, #E8F8E8 25%, #FFF8E8 50%, #E8E8FF 75%, #F8E8FF 100%)",
        position: "relative"
      }}>
      {/* Background GIF */}
      <img 
        src={helpGif} 
        alt="Mental Health Support Background" 
        style={{
          position: "fixed",
          top: "10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          zIndex: -1,
          opacity: 0.15,
          pointerEvents: "none",
          borderRadius: "50%",
          filter: "blur(1px)"
        }}
      />
      
      <div style={{ padding: "0.5rem", position: "relative", zIndex: 1 }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: "center", 
        padding: "1rem 2rem 2rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{
          background: "linear-gradient(-45deg, rgba(255, 255, 255, 0.4), rgba(186, 104, 200, 0.2), rgba(102, 187, 106, 0.2), rgba(255, 213, 79, 0.2))",
          backgroundSize: "400% 400%",
          animation: "gradientSlide 8s ease infinite",
          backdropFilter: "blur(20px)",
          borderRadius: "30px",
          padding: "2.5rem 2rem",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: "0 20px 60px rgba(186, 104, 200, 0.2)",
          height: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          
          {currentSlide === 0 ? (
            // Text Content Slide
            <div className="slide-content" style={{ textAlign: "center", width: "100%" }}>
              <div style={{
                display: "inline-block",
                background: "#BA68C8",
                borderRadius: "20px",
                padding: "0.5rem 2rem",
                marginBottom: "1rem"
              }}>
                <span style={{
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontFamily: "'Times New Roman', serif"
                }}>
                  Mental Health Platform
                </span>
              </div>
              
              <h1 style={{ 
                fontSize: "3.5rem", 
                margin: "0 0 1rem 0", 
                fontWeight: "300",
                color: "#2C3E50",
                fontFamily: "'Times New Roman', serif",
                lineHeight: "1.2",
                letterSpacing: "-1px"
              }}>
                Your Journey to
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #9E83B8, #758976)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: "700"
                }}>
                  Wellness Starts Here
                </span>
              </h1>
              
              <p style={{ 
                fontSize: "1.2rem", 
                margin: "0 auto 2rem auto", 
                color: "#5D6D7E",
                fontWeight: "400",
                fontFamily: "'Times New Roman', serif",
                lineHeight: "1.6",
                maxWidth: "700px"
              }}>
                Connect with licensed therapists in a secure, convenient environment. 
                <br />
                Professional mental health care, tailored to your needs.
              </p>
            </div>
          ) : currentSlide === 1 ? (
            // Help GIF Content Slide
            <div className="slide-content" style={{ textAlign: "center", width: "100%" }}>
              <img 
                src={helpGif}
                alt="Mental Health Support"
                style={{
                  width: "350px",
                  height: "350px",
                  objectFit: "cover",
                  flexShrink: 0
                }}
              />
              <h2 style={{
                fontSize: "2.5rem",
                fontWeight: "300",
                color: "#2C3E50",
                fontFamily: "'Times New Roman', serif",
                marginTop: "2rem",
                marginBottom: "1rem",
                lineHeight: "1.2",
                letterSpacing: "-0.5px"
              }}>
                We're Here to Help
              </h2>
              <p style={{
                fontSize: "1.3rem",
                color: "#5D6D7E",
                fontFamily: "'Times New Roman', serif",
                maxWidth: "650px",
                margin: "0 auto",
                lineHeight: "1.6",
                fontWeight: "400"
              }}>
                Take the first step towards{" "}
                <span style={{
                  color: "#BA68C8",
                  fontWeight: "600"
                }}>
                  better mental health
                </span>{" "}
                with our caring professionals.
              </p>
            </div>
          ) : (
            // Flowers GIF Content Slide
            <div className="slide-content" style={{ textAlign: "center", width: "100%" }}>
              <img 
                src={flowersGif}
                alt="Mental Health Flowers"
                style={{
                  width: "350px",
                  height: "350px",
                  objectFit: "cover",
                  flexShrink: 0
                }}
              />
              <h2 style={{
                fontSize: "2.5rem",
                fontWeight: "300",
                color: "#2C3E50",
                fontFamily: "'Times New Roman', serif",
                marginTop: "2rem",
                marginBottom: "1rem",
                lineHeight: "1.2",
                letterSpacing: "-0.5px"
              }}>
                Let your Mind Bloom
              </h2>
              <p style={{
                fontSize: "1.3rem",
                color: "#5D6D7E",
                fontFamily: "'Times New Roman', serif",
                maxWidth: "650px",
                margin: "0 auto",
                lineHeight: "1.6",
                fontWeight: "400"
              }}>
                Nurture your mental wellness and{" "}
                <span style={{
                  color: "#66BB6A",
                  fontWeight: "600"
                }}>
                  flourish
                </span>{" "}
                with personalized therapeutic support.
              </p>
            </div>
          )}
        </div>

        {/* Feature Badges - Outside the hero box */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
          marginTop: "2rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            background: "rgba(102, 187, 106, 0.2)",
            border: "2px solid rgba(102, 187, 106, 0.4)",
            borderRadius: "15px",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <span style={{
              color: "#2E7D32",
              fontWeight: "600",
              fontSize: "0.9rem",
              fontFamily: "'Times New Roman', serif"
            }}>
              Licensed Professionals
            </span>
          </div>
          
          <div style={{
            background: "rgba(186, 104, 200, 0.2)",
            border: "2px solid rgba(186, 104, 200, 0.4)",
            borderRadius: "15px",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <span style={{
              color: "#7B1FA2",
              fontWeight: "600",
              fontSize: "0.9rem",
              fontFamily: "'Times New Roman', serif"
            }}>
              Secure & Private
            </span>
          </div>
          
          <div style={{
            background: "rgba(255, 213, 79, 0.2)",
            border: "2px solid rgba(255, 213, 79, 0.4)",
            borderRadius: "15px",
            padding: "1rem 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <span style={{
              color: "#F57F17",
              fontWeight: "600",
              fontSize: "0.9rem",
              fontFamily: "'Times New Roman', serif"
            }}>
              24/7 Available
            </span>
          </div>
        </div>


        {/* Search Section */}
        <div style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(15px)",
          borderRadius: "25px",
          padding: "1.5rem",
          marginTop: "1.5rem",
          border: "2px solid rgba(186, 104, 200, 0.3)",
          boxShadow: "0 10px 40px rgba(186, 104, 200, 0.2)"
        }}>
          <form onSubmit={handleSearch} style={{ 
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            maxWidth: "600px",
            margin: "0 auto",
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            <div style={{ 
              position: "relative",
              flex: "1",
              minWidth: "300px"
            }}>
              <input
                type="text"
                placeholder="Search therapists by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            style={{ 
                  width: "100%",
                  padding: "1.2rem 1.5rem", 
                  borderRadius: "20px",
                  border: "2px solid rgba(186, 104, 200, 0.3)",
              fontSize: "1rem",
                  fontFamily: "'Times New Roman', serif",
                  background: "rgba(255, 255, 255, 0.9)",
                  transition: "all 0.3s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#BA68C8";
                  e.target.style.boxShadow = "0 0 20px rgba(186, 104, 200, 0.4)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(186, 104, 200, 0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          <button 
              type="submit" 
            style={{ 
                padding: "1.2rem 2.5rem",
                background: "#ffc872",
              color: "white",
                border: "none",
                borderRadius: "20px",
              fontSize: "1rem",
                fontWeight: "600",
              cursor: "pointer",
                fontFamily: "'Times New Roman', serif",
                transition: "all 0.3s ease",
                boxShadow: "0 5px 20px rgba(255, 200, 114, 0.4)",
                position: "relative",
                zIndex: 10
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 30px rgba(255, 200, 114, 0.6)";
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "0 5px 20px rgba(255, 200, 114, 0.4)";
              }}
            >
              🔍 Find Therapist
          </button>
        </form>
        </div>
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
          <div className="modal-scroll" style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "400px",
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
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
              
              <div style={{ marginBottom: "1.5rem", position: "relative" }}>
                <input
                  type={showTherapistPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={therapistAuth.password}
                  onChange={handleTherapistAuthChange}
                  required
                  disabled={loginLoading}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    paddingRight: "3rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    boxSizing: "border-box",
                    opacity: loginLoading ? 0.7 : 1
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTherapistPassword(!showTherapistPassword)}
                  disabled={loginLoading}
                  aria-label={showTherapistPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "0.5rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: loginLoading ? "not-allowed" : "pointer",
                    color: "#667eea",
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.9rem"
                  }}
                >
                  {showTherapistPassword ? "Hide" : "Show"}
                </button>
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
                Email: john@example.com<br/>
                Password: StrongPass123!
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
          <div className="modal-scroll" style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "420px",
            maxWidth: "90%",
            maxHeight: "90vh",
            overflowY: "auto"
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
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPatientLoginPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={patientAuth.password}
                        onChange={handlePatientAuthChange}
                        required
                        disabled={patientLoading}
                        style={{
                          width: "100%",
                          padding: "1rem",
                          paddingRight: "3rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "10px",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                          opacity: patientLoading ? 0.7 : 1
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPatientLoginPassword(!showPatientLoginPassword)}
                        disabled={patientLoading}
                        aria-label={showPatientLoginPassword ? "Hide password" : "Show password"}
                        style={{
                          position: "absolute",
                          right: "0.5rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: patientLoading ? "not-allowed" : "pointer",
                          color: "#667eea",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.9rem"
                        }}
                      >
                        {showPatientLoginPassword ? "Hide" : "Show"}
                      </button>
                    </div>
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
                      pattern="[A-Za-z][A-Za-z'\-\s]{1,49}"
                      title="Letters, spaces, hyphens, apostrophes; 2-50 characters"
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
                      pattern="[A-Za-z][A-Za-z'\-\s]{1,49}"
                      title="Letters, spaces, hyphens, apostrophes; 2-50 characters"
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
                      type="tel"
                      name="phone_no"
                      placeholder="Phone Number"
                      value={patientAuth.phone_no}
                      onChange={handlePatientAuthChange}
                      required
                      disabled={patientLoading}
                      pattern="[0-9+()\-\s]{10,20}"
                      title="10-15 digits; you may use +, spaces, dashes, or parentheses"
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
                      inputMode="email"
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
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPatientSignupPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={patientAuth.password}
                        onChange={handlePatientAuthChange}
                        required
                        disabled={patientLoading}
                        minLength={8}
                        title="At least 8 characters"
                        style={{
                          width: "100%",
                          padding: "1rem",
                          paddingRight: "3rem",
                          border: "2px solid #e0e0e0",
                          borderRadius: "10px",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                          opacity: patientLoading ? 0.7 : 1
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPatientSignupPassword(!showPatientSignupPassword)}
                        disabled={patientLoading}
                        aria-label={showPatientSignupPassword ? "Hide password" : "Show password"}
                        style={{
                          position: "absolute",
                          right: "0.5rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          cursor: patientLoading ? "not-allowed" : "pointer",
                          color: "#667eea",
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.9rem"
                        }}
                      >
                        {showPatientSignupPassword ? "Hide" : "Show"}
                      </button>
                    </div>
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
          <div className="modal-scroll" style={{
            background: "white",
            borderRadius: "20px",
            padding: "0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "620px",
            maxWidth: "95%",
            maxHeight: "92vh",
            overflowY: "auto",
            border: "1px solid #eef0f4"
          }}>
            <div style={{ height: "6px", width: "100%", background: "linear-gradient(90deg, #667eea, #4CAF50)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }} />
            <div style={{ padding: "1.5rem 2rem 0.5rem 2rem" }}>
              <div style={{ textAlign: "center", color: "#667eea", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Step 2 of 2</div>
              <h2 style={{ textAlign: "center", color: "#333", margin: "0 0 1rem 0", fontSize: "1.6rem", fontWeight: "400" }}>
                👤 Complete Patient Profile
              </h2>
            </div>
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
            <form onSubmit={handlePatientDetailsSubmit} style={{ padding: "0 2rem 1.5rem 2rem" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "0.9rem"
              }}>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>First Name <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="first_name" placeholder="First Name" value={patientDetails.first_name} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Last Name <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="last_name" placeholder="Last Name" value={patientDetails.last_name} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Phone Number <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="phone_no" placeholder="Phone Number" value={patientDetails.phone_no} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Email <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="email" placeholder="Email" type="email" value={patientDetails.email || ""} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Date of Birth <span style={{ color: "#d32f2f" }}>*</span></div>
                  <input name="date_of_birth" placeholder="Date of Birth" type="date" value={patientDetails.date_of_birth} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                </div>
                <div>
                  <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Sex <span style={{ color: "#d32f2f" }}>*</span></div>
                  <select name="sex" value={patientDetails.sex} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ width: "100%", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }}>
                    <option value="">Select Sex</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                    <option value="P">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: "0.5rem", color: "#555", fontSize: "0.9rem" }}>If nothing applies, type 'none'.</div>
              <div style={{ marginTop: "0.5rem", padding: "1rem", background: "#f8f9fb", border: "1px solid #eef0f4", borderRadius: "12px" }}>
                <div style={{ marginBottom: "0.25rem", color: "#333", fontSize: "0.9rem" }}>Allergies and Medication <span style={{ color: "#d32f2f" }}>*</span></div>
                <textarea name="allergies_and_medication" placeholder="Allergies and Medication (required)" value={patientDetails.allergies_and_medication} onChange={handlePatientDetailsChange} required disabled={patientDetailsLoading} style={{ marginTop: "0.25rem", width: "100%", minHeight: "90px", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                <textarea name="address" placeholder="Address (optional)" value={patientDetails.address || ""} onChange={handlePatientDetailsChange} disabled={patientDetailsLoading} style={{ marginTop: "0.75rem", width: "100%", minHeight: "70px", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
                <textarea name="about_note" placeholder="About (optional)" value={patientDetails.about_note || ""} onChange={handlePatientDetailsChange} disabled={patientDetailsLoading} style={{ marginTop: "0.75rem", width: "100%", minHeight: "70px", padding: "0.85rem", border: "1px solid #e0e0e0", borderRadius: "10px", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.1rem" }}>
                <button type="submit" disabled={patientDetailsLoading} style={{ flex: 1, padding: "0.95rem", background: patientDetailsLoading ? "#ccc" : "linear-gradient(90deg, #667eea, #5a6fd8)", color: "white", border: "none", borderRadius: "10px", cursor: patientDetailsLoading ? "not-allowed" : "pointer" }}>
                  {patientDetailsLoading ? "Creating..." : "Create Account"}
                </button>
                <button type="button" onClick={() => { setShowPatientDetailsModal(false); setShowPatientAuth(true); setPatientMode('signup'); }} disabled={patientDetailsLoading} style={{ padding: "0.95rem 1rem", background: "transparent", color: "#666", border: "1px solid #e0e0e0", borderRadius: "10px", cursor: "pointer" }}>Back</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Platform Information Section */}
      <div style={{
        padding: "1rem 2rem 4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "1.5rem",
          alignItems: "center"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            padding: "2rem",
            borderRadius: "25px",
            border: "2px solid rgba(102, 187, 106, 0.3)",
            boxShadow: "0 15px 50px rgba(102, 187, 106, 0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.boxShadow = "0 25px 70px rgba(102, 187, 106, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "0 15px 50px rgba(102, 187, 106, 0.2)";
          }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #66BB6A, #A5D6A7)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              fontSize: "2rem"
            }}>
              🩺
            </div>
            <h3 style={{
              fontSize: "1.4rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#2C3E50",
              fontFamily: "'Times New Roman', serif"
            }}>
              Expert Therapists
            </h3>
            <p style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#5D6D7E",
              fontFamily: "'Times New Roman', serif",
              margin: 0
            }}>
              Connect with board-certified mental health professionals who specialize in various therapeutic approaches.
            </p>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            padding: "2rem",
            borderRadius: "25px",
            border: "2px solid rgba(186, 104, 200, 0.3)",
            boxShadow: "0 15px 50px rgba(186, 104, 200, 0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.boxShadow = "0 25px 70px rgba(186, 104, 200, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "0 15px 50px rgba(186, 104, 200, 0.2)";
          }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #BA68C8, #E1BEE7)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              fontSize: "2rem"
            }}>
              📅
            </div>
            <h3 style={{
              fontSize: "1.4rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#2C3E50",
              fontFamily: "'Times New Roman', serif"
            }}>
              Flexible Scheduling
            </h3>
            <p style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#5D6D7E",
              fontFamily: "'Times New Roman', serif",
              margin: 0
            }}>
              Book sessions that fit your lifestyle with our intuitive scheduling system and real-time availability.
            </p>
          </div>

          <div style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            padding: "2rem",
            borderRadius: "25px",
            border: "2px solid rgba(255, 213, 79, 0.4)",
            boxShadow: "0 15px 50px rgba(255, 213, 79, 0.2)",
            transition: "all 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-10px)";
            e.currentTarget.style.boxShadow = "0 25px 70px rgba(255, 213, 79, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "0 15px 50px rgba(255, 213, 79, 0.2)";
          }}
          >
            <div style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #FFD54F, #FFF176)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              fontSize: "2rem"
            }}>
              🔒
            </div>
            <h3 style={{
              fontSize: "1.4rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#2C3E50",
              fontFamily: "'Times New Roman', serif"
            }}>
              Complete Privacy
            </h3>
            <p style={{
              fontSize: "1rem",
              lineHeight: "1.6",
              color: "#5D6D7E",
              fontFamily: "'Times New Roman', serif",
              margin: 0
            }}>
              Your conversations are protected with end-to-end encryption and HIPAA-compliant security measures.
            </p>
          </div>
        </div>
      </div>

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
          <h3 style={{ 
            textAlign: "center", 
            color: "#333", 
            marginBottom: "2rem",
            fontSize: "2rem",
            fontWeight: "200",
            fontFamily: "'Times New Roman', serif"
          }}>
            Find your therapist...
          </h3>
          
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

        /* Custom Scrollbar for modals (no halo, fully rounded) */
        .modal-scroll {
          scrollbar-color: #8fa0ff transparent; /* Firefox: thumb | track */
          scrollbar-width: none; /* Firefox: hide scrollbar incl. arrows */
          -ms-overflow-style: none; /* IE/Edge (legacy): hide scrollbar */
        }
        .modal-scroll::-webkit-scrollbar {
          width: 0 !important; /* Chrome/Safari/Edge: hide scrollbar */
          height: 0 !important;
          background: transparent;
        }
        /* Keep buttons hidden even if engine attempts to render */
        .modal-scroll::-webkit-scrollbar-button {
          display: none;
          height: 0;
          width: 0;
          background: transparent;
          background-image: none !important;
          border: none;
          outline: none;
        }
        .modal-scroll::-webkit-scrollbar-button:single-button {
          display: none;
          height: 0;
          width: 0;
          background: transparent;
          background-image: none !important;
          border: none;
          outline: none;
        }
        .modal-scroll::-webkit-scrollbar-button:start:decrement,
        .modal-scroll::-webkit-scrollbar-button:end:increment {
          display: none;
          height: 0;
          width: 0;
          background: transparent;
          background-image: none !important;
          border: none;
          outline: none;
        }
        /* Explicitly hide all directional buttons */
        .modal-scroll::-webkit-scrollbar-button:single-button:vertical:increment,
        .modal-scroll::-webkit-scrollbar-button:single-button:vertical:decrement,
        .modal-scroll::-webkit-scrollbar-button:single-button:horizontal:increment,
        .modal-scroll::-webkit-scrollbar-button:single-button:horizontal:decrement,
        .modal-scroll::-webkit-scrollbar-button:start:increment,
        .modal-scroll::-webkit-scrollbar-button:end:decrement {
          display: none;
          height: 0;
          width: 0;
          background: transparent;
          background-image: none !important;
          border: none;
          outline: none;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 999px;
          margin: 12px 0; /* further inset to tuck ends cleanly */
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #667eea, #5a6fd8);
          border-radius: 999px;
          border: none; /* remove light outline/halo */
          box-shadow: inset 0 0 0 0 rgba(0,0,0,0); /* ensure no halo */
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #5a6fd8, #4c5fd2);
        }
        .modal-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      {/* Login Choice Popup */}
      {showLoginPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            maxWidth: "400px",
            width: "90%"
          }}>
            <p style={{
              fontSize: "1.8rem",
              fontWeight: "600",
              color: "#758976",
              fontFamily: "'Times New Roman', serif",
              marginBottom: "1rem"
            }}>
              Log in to your account.
            </p>
            
          

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem"
            }}>
              <button
                onClick={() => {
                  setShowLoginPopup(false);
                  setShowPatientAuth(true);
                  setPatientMode("login");
                }}
                style={{
                  padding: "1rem 2rem",
                  background: "#e6ddd6",
                  border: "none",
                  color: "dark gray",
                  borderRadius: "15px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Times New Roman', serif"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0px)"}
              >
                👤 I'm a Client
              </button>

              <button
                onClick={() => {
                  setShowLoginPopup(false);
                  setShowTherapistSignIn(true);
                }}
                style={{
                  padding: "1rem 2rem",
                  background: "  linear-gradient(135deg, #4CAF50, #8BC34A)",
                  border: "none",
                  color: "white",
                  borderRadius: "15px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Times New Roman', serif"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0px)"}
              >
                🩺 I'm a Therapist
              </button>

              <button
                onClick={() => setShowLoginPopup(false)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "transparent",
                  border: "1px solid #ccc",
                  color: "#666",
                  borderRadius: "15px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "'Times New Roman', serif",
                  marginTop: "1rem"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f5f5f5";
                  e.target.style.borderColor = "#999";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "#ccc";
                }}
              >
                Cancel
              </button>
    </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </>
  );
}

