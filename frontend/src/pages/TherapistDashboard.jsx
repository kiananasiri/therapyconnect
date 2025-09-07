import React, { useState, useEffect } from "react";
import { getTherapist, getTherapistPatients, getTherapistCalendarSessions } from "../api";
import avatar from "../assets/avatar.png"; // ✅ use local asset

// Mock therapist ID for now - in real app, this would come from auth context
const MOCK_THERAPIST_ID = "t_abc123";

export default function TherapistDashboard() {
  const [therapist, setTherapist] = useState(null);
  const [patients, setPatients] = useState([]);
  const [calendarSessions, setCalendarSessions] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch therapist data and dashboard info
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch therapist profile
        const therapistResponse = await getTherapist(MOCK_THERAPIST_ID);
        setTherapist(therapistResponse.data);
        
        // Fetch therapist's patients
        const patientsResponse = await getTherapistPatients(MOCK_THERAPIST_ID);
        setPatients(patientsResponse.data);
        
        // Fetch calendar sessions for current month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const sessionsResponse = await getTherapistCalendarSessions(MOCK_THERAPIST_ID, year, month);
        setCalendarSessions(sessionsResponse.data.sessions);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to mock data
        setTherapist({
          first_name: "Dr. Alice",
          last_name: "Smith",
          profile_picture: null,
          about_note: "I am a licensed therapist specializing in Cognitive Behavioral Therapy.",
          area_of_expertise: ["Cognitive Therapy", "Stress Management", "Anxiety"],
          wallet_balance: 320,
        });
        setPatients([]);
        setCalendarSessions({});
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentDate]);

  // Navigate calendar months
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDate = (day) => {
    if (!day) return '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "100px",
        height: "100px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite"
      }}></div>
      <div style={{
        position: "absolute",
        top: "60%",
        right: "10%",
        width: "150px",
        height: "150px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite reverse"
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "15%",
        width: "80px",
        height: "80px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "50%",
        animation: "float 7s ease-in-out infinite"
      }}></div>

      <div style={{ 
        padding: "2rem", 
        position: "relative",
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "2rem",
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "1.5rem 2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <div>
            <h1 style={{ 
              margin: 0,
              fontSize: "2.5rem",
              background: "linear-gradient(45deg, #fff, #f0f8ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "300",
              textShadow: "0 0 30px rgba(255,255,255,0.3)"
            }}>
              ✨ Therapist Dashboard
            </h1>
            <p style={{
              margin: "0.5rem 0 0 0",
              color: "rgba(255,255,255,0.8)",
              fontSize: "1.1rem"
            }}>
              Welcome back, {therapist ? `${therapist.first_name}!` : 'Doctor!'}
            </p>
          </div>
        <div
          style={{
              background: "linear-gradient(135deg, #4CAF50, #45a049)",
              padding: "1rem 2rem",
              borderRadius: "25px",
              color: "white",
            fontWeight: "bold",
              fontSize: "1.2rem",
              boxShadow: "0 8px 25px rgba(76, 175, 80, 0.3)",
              border: "2px solid rgba(255,255,255,0.2)",
              animation: "pulse 2s infinite"
          }}
        >
            💰 ${therapist?.wallet_balance || 0}
        </div>
      </div>

        {/* Main Content: 3 Columns */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "320px 1fr 380px", 
          gap: "2rem",
          height: "calc(100vh - 200px)"
        }}>
        {/* Left Column: Profile */}
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: "2rem",
            borderRadius: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            position: "relative",
            overflow: "hidden",
            animation: "slideInLeft 0.8s ease-out"
          }}>
            {/* Decorative anime-style sparkles */}
            <div style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              fontSize: "1.5rem",
              animation: "sparkle 2s ease-in-out infinite"
            }}>✨</div>
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              fontSize: "1rem",
              animation: "sparkle 2.5s ease-in-out infinite reverse"
            }}>🌟</div>

            <div style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              padding: "5px",
              marginBottom: "1.5rem",
              position: "relative",
              animation: "profileGlow 3s ease-in-out infinite"
            }}>
              <img
                src={therapist?.profile_picture || avatar}
            alt="Profile"
                style={{ 
                  width: "100%", 
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid white"
                }}
              />
              <div style={{
                position: "absolute",
                bottom: "5px",
                right: "5px",
                width: "25px",
                height: "25px",
                background: "#4CAF50",
                borderRadius: "50%",
                border: "3px solid white",
                animation: "pulse 2s infinite"
              }}></div>
            </div>

            <h2 style={{ 
              margin: "0 0 1rem 0", 
              textAlign: "center",
              fontSize: "1.8rem",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "600"
            }}>
              {therapist ? `Dr. ${therapist.first_name} ${therapist.last_name}` : "Loading..."}
            </h2>
            
            <div style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(240, 147, 251, 0.3)"
            }}>
              🏆 Top Rated Therapist
            </div>

            <p style={{ 
              textAlign: "center", 
              fontSize: "14px", 
              color: "#555", 
              marginBottom: "1.5rem",
              lineHeight: "1.5",
              fontStyle: "italic"
            }}>
              "{therapist?.about_note || 'Dedicated to helping you achieve mental wellness and personal growth.'}"
            </p>

            {therapist?.area_of_expertise && (
              <div style={{ width: "100%" }}>
                <h4 style={{ 
                  fontSize: "16px",
                  color: "#333",
                  marginBottom: "1rem",
                  textAlign: "center",
                  fontWeight: "600"
                }}>
                  🎯 Specialties
                </h4>
                <div style={{ 
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}>
                  {therapist.area_of_expertise.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                        animation: `tagFloat ${2 + i * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
          </div>
            )}
        </div>

          {/* Center Column: Calendar */}
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: "2rem",
            borderRadius: "25px",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden",
            animation: "slideInUp 0.8s ease-out 0.2s both"
          }}>
            {/* Anime-style decorative elements */}
            <div style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              fontSize: "1.2rem",
              animation: "sparkle 2.5s ease-in-out infinite"
            }}>🗓️</div>

            {/* Calendar Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "2rem",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              padding: "1rem 1.5rem",
              borderRadius: "20px",
              color: "white",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
            }}>
            <button
                onClick={() => navigateMonth(-1)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.3)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                ← Previous
            </button>
              
              <h3 style={{ 
                margin: 0,
                fontSize: "1.8rem",
                fontWeight: "300",
                textShadow: "0 0 20px rgba(255,255,255,0.3)",
                animation: "textGlow 3s ease-in-out infinite"
              }}>
                📅 {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              
              <button
                onClick={() => navigateMonth(1)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "15px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.3)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Next →
              </button>
            </div>

            {/* Calendar Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(7, 1fr)", 
              gap: "8px", 
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.5)",
              borderRadius: "20px",
              backdropFilter: "blur(10px)"
            }}>
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} style={{
                  padding: "1rem 0.5rem",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#667eea",
                  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                  borderRadius: "15px",
                  border: "1px solid rgba(102, 126, 234, 0.2)",
                  animation: `dayHeaderFloat ${2 + index * 0.1}s ease-in-out infinite`,
                  animationDelay: `${index * 0.1}s`
                }}>
                  {day}
                </div>
              ))}
            
              {/* Calendar days */}
              {generateCalendarDays().map((day, index) => {
                const dateStr = formatDate(day);
                const daySessions = calendarSessions[dateStr] || [];
                const isToday = day && new Date().getDate() === day && 
                               new Date().getMonth() === currentDate.getMonth() &&
                               new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <div
                    key={index}
                    onMouseEnter={() => day && setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    style={{
                      minHeight: "70px",
                      padding: "0.75rem",
                      borderRadius: "15px",
                      background: day ? 
                        (isToday ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" :
                         daySessions.length > 0 ? "linear-gradient(135deg, #4CAF50, #45a049)" :
                         "rgba(255,255,255,0.8)") : 
                        "rgba(240,240,240,0.3)",
                      cursor: day ? "pointer" : "default",
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: day ? "2px solid rgba(255,255,255,0.3)" : "1px solid rgba(200,200,200,0.3)",
                      boxShadow: day ? "0 4px 15px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.3s ease",
                      animation: day ? `dayFloat ${3 + (index % 7) * 0.2}s ease-in-out infinite` : "none",
                      animationDelay: `${index * 0.05}s`,
                      color: day ? (isToday || daySessions.length > 0 ? "white" : "#333") : "#999"
                    }}
                    onMouseEnter={(e) => {
                      if (day) {
                        e.target.style.transform = "translateY(-3px) scale(1.05)";
                        e.target.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day) {
                        e.target.style.transform = "translateY(0) scale(1)";
                        e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                      }
                    }}
                  >
                    {day && (
                      <>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "flex-start" 
                        }}>
                          <span style={{ 
                            fontSize: "16px", 
                            fontWeight: "600",
                            textShadow: (isToday || daySessions.length > 0) ? "0 0 10px rgba(255,255,255,0.5)" : "none"
                          }}>
                            {day}
                          </span>
                          {isToday && (
                            <div style={{
                              fontSize: "0.8rem",
                              animation: "sparkle 1.5s ease-in-out infinite"
                            }}>✨</div>
                          )}
                        </div>
                        
                        {daySessions.length > 0 && (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.25rem",
                            marginTop: "0.5rem"
                          }}>
                            <div style={{
                              width: "12px",
                              height: "12px",
                              background: isToday ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.9)",
                              borderRadius: "50%",
                              animation: "pulse 2s infinite"
                            }} />
                            <span style={{ 
                              fontSize: "11px", 
                              fontWeight: "500",
                              textShadow: "0 0 10px rgba(255,255,255,0.5)"
                            }}>
                              {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </>
                    )}
              </div>
            );
          })}
            </div>
        </div>

        {/* Hover details */}
            {hoveredDate && calendarSessions[hoveredDate] && (
              <div style={{ 
                padding: "1.5rem", 
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,248,255,0.95))",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                animation: "slideInUp 0.3s ease-out"
              }}>
                <h4 style={{ 
                  margin: "0 0 1rem 0",
                  color: "#667eea",
                  fontSize: "1.3rem",
                  fontWeight: "600",
                  textAlign: "center"
                }}>
                  📅 Sessions on {new Date(hoveredDate).toLocaleDateString()}
                </h4>
                {calendarSessions[hoveredDate].map((session, index) => (
                  <div key={session.id} style={{ 
                    padding: "1rem",
                    marginBottom: index < calendarSessions[hoveredDate].length - 1 ? "0.75rem" : "0",
                    borderRadius: "15px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                    animation: `sessionCard ${0.5 + index * 0.1}s ease-out`,
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "both"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      marginBottom: "0.5rem"
                    }}>
                      <strong style={{ fontSize: "1.1rem" }}>🕐 {session.start_time}</strong>
                      <span style={{ 
                        background: "rgba(255,255,255,0.2)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem"
                      }}>
                        {session.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                      👤 {session.patient_name}
                    </div>
                    <div style={{ 
                      fontSize: "0.9rem", 
                      opacity: "0.9",
                      display: "flex",
                      gap: "1rem"
                    }}>
                      <span>⏱️ {session.duration} min</span>
                      <span>💰 ${session.fee}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

          {/* Right Column: Patient List */}
          <div style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            padding: "2rem",
            borderRadius: "25px",
            overflowY: "auto",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            position: "relative",
            animation: "slideInRight 0.8s ease-out 0.4s both"
          }}>
            {/* Decorative elements */}
            <div style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              fontSize: "1.2rem",
              animation: "sparkle 2s ease-in-out infinite"
            }}>👥</div>

            <div style={{
              textAlign: "center",
              marginBottom: "2rem"
            }}>
              <h3 style={{ 
                margin: "0 0 0.5rem 0",
                fontSize: "1.8rem",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "600"
              }}>
                My Patients
              </h3>
              <div style={{
                background: "linear-gradient(135deg, #4CAF50, #45a049)",
                color: "white",
                padding: "0.5rem 1.5rem",
                borderRadius: "20px",
                fontSize: "1rem",
                fontWeight: "500",
                display: "inline-block",
                boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
                animation: "pulse 2s infinite"
              }}>
                {patients.length} Active Patients
              </div>
            </div>
            <div style={{ 
              maxHeight: "calc(100vh - 400px)",
              overflowY: "auto",
              paddingRight: "0.5rem"
            }}>
              {patients.length === 0 ? (
                <div style={{ 
                  textAlign: "center",
                  padding: "2rem",
                  color: "#666",
                  fontSize: "1.1rem"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
                  <p>No patients found</p>
                  <p style={{ fontSize: "0.9rem", opacity: "0.7" }}>
                    Your patient list will appear here once you start accepting appointments
                  </p>
                </div>
              ) : (
                patients.map((patient, index) => (
                  <div
                    key={patient.id}
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,248,255,0.9))",
                      backdropFilter: "blur(10px)",
                      padding: "1.5rem",
                      marginBottom: "1rem",
                      borderRadius: "20px",
                      border: "1px solid rgba(102, 126, 234, 0.2)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      position: "relative",
                      overflow: "hidden",
                      animation: `patientCard ${0.6 + index * 0.1}s ease-out`,
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: "both"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-3px) scale(1.02)";
                      e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0) scale(1)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                    }}
                  >
                    {/* Decorative sparkle */}
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      fontSize: "0.8rem",
                      animation: "sparkle 2s ease-in-out infinite",
                      animationDelay: `${index * 0.3}s`
                    }}>✨</div>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        padding: "3px",
                        marginRight: "1rem"
                      }}>
                        <img
                          src={patient.profile_picture || avatar}
                          alt={patient.full_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid white"
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: "600", 
                          fontSize: "1rem",
                          color: "#333",
                          marginBottom: "0.25rem"
                        }}>
                          {patient.full_name}
                        </div>
                        <div style={{ 
                          fontSize: "0.9rem", 
                          color: "#667eea",
                          fontWeight: "500"
                        }}>
                          📊 {patient.session_count} session{patient.session_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    {patient.last_session_date && (
                      <div style={{ 
                        fontSize: "0.85rem", 
                        color: "#666",
                        marginBottom: "0.75rem",
                        padding: "0.5rem",
                        background: "rgba(102, 126, 234, 0.1)",
                        borderRadius: "10px",
                        textAlign: "center"
                      }}>
                        🕐 Last session: {new Date(patient.last_session_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {patient.tags && patient.tags.length > 0 && (
                      <div style={{ 
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        justifyContent: "center"
                      }}>
                        {patient.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            style={{
                              display: "inline-block",
                              background: "linear-gradient(135deg, #f093fb, #f5576c)",
                              color: "white",
                              padding: "0.25rem 0.75rem",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              boxShadow: "0 2px 8px rgba(240, 147, 251, 0.3)",
                              animation: `tagBounce ${1.5 + i * 0.2}s ease-in-out infinite`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          >
                            {tag}
                          </span>
              ))}
          </div>
        )}
                  </div>
                ))
              )}
            </div>
          </div>
          {/* CSS Animations */}
          <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.8; 
          }
          25% { 
            transform: scale(1.2) rotate(90deg); 
            opacity: 1; 
          }
          50% { 
            transform: scale(0.8) rotate(180deg); 
            opacity: 0.6; 
          }
          75% { 
            transform: scale(1.1) rotate(270deg); 
            opacity: 1; 
          }
        }

        @keyframes slideInLeft {
          0% { 
            transform: translateX(-100px); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }

        @keyframes slideInUp {
          0% { 
            transform: translateY(100px); 
            opacity: 0; 
          }
          100% { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }

        @keyframes slideInRight {
          0% { 
            transform: translateX(100px); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }

        @keyframes profileGlow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(102, 126, 234, 0.6); 
          }
        }

        @keyframes textGlow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(255,255,255,0.3); 
          }
          50% { 
            text-shadow: 0 0 30px rgba(255,255,255,0.8); 
          }
        }

        @keyframes tagFloat {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-5px); 
          }
        }

        @keyframes dayHeaderFloat {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-3px); 
          }
        }

        @keyframes dayFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          50% { 
            transform: translateY(-2px) scale(1.02); 
          }
        }

        @keyframes sessionCard {
          0% { 
            transform: translateX(-20px); 
            opacity: 0; 
          }
          100% { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }

        @keyframes patientCard {
          0% { 
            transform: translateY(20px) scale(0.95); 
            opacity: 0; 
          }
          100% { 
            transform: translateY(0) scale(1); 
            opacity: 1; 
          }
        }

        @keyframes tagBounce {
          0%, 100% { 
            transform: scale(1); 
          }
          50% { 
            transform: scale(1.05); 
          }
        }

        /* Custom scrollbar for patient list */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a6fd8, #6a4190);
        }
        `}</style>
      </div>
    </div>
  );
}
