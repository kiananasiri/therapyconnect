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
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch therapist data and dashboard info
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch therapist profile
        const therapistResponse = await getTherapist(MOCK_THERAPIST_ID);
        setTherapist(therapistResponse.data);
        
        // Fetch calendar sessions for current month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const sessionsResponse = await getTherapistCalendarSessions(MOCK_THERAPIST_ID, year, month);
        setCalendarSessions(sessionsResponse.data.sessions);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        // Fallback to mock data
        setTherapist({
          first_name: "Dr. Alice",
          last_name: "Smith",
          profile_picture: null,
          about_note: "I am a licensed therapist specializing in Cognitive Behavioral Therapy.",
          area_of_expertise: ["Cognitive Therapy", "Stress Management", "Anxiety"],
          wallet_balance: 320,
        });
        setCalendarSessions({});
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentDate]);

  // Fetch patients data separately
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setPatientsLoading(true);
        const patientsResponse = await getTherapistPatients(MOCK_THERAPIST_ID);
        setPatients(patientsResponse.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

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
    return (
      <div style={{ 
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}>
        <div style={{
          background: "white",
          padding: "3rem",
          borderRadius: "12px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #4CAF50",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1.5rem"
          }}></div>
          <h3 style={{ 
            color: "#2E7D32", 
            margin: "0 0 0.5rem 0",
            fontSize: "1.3rem"
          }}>
            Loading Dashboard...
          </h3>
          <p style={{ 
            color: "#666", 
            margin: 0,
            fontSize: "0.9rem"
          }}>
            Preparing your therapy session data
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "2rem"
    }}>

      {/* Header */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{
              margin: "0 0 0.5rem 0",
              color: "#2E7D32",
              fontSize: "2rem",
              fontWeight: "600"
            }}>
              Therapist Dashboard
            </h1>
            <p style={{
              margin: 0,
              color: "#666",
              fontSize: "1.1rem"
            }}>
              Welcome back, {therapist ? `Dr. ${therapist.first_name} ${therapist.last_name}` : "Loading..."}
            </p>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}>
            <div style={{
              textAlign: "right"
            }}>
              <div style={{
                color: "#2E7D32",
                fontSize: "1.2rem",
                fontWeight: "600"
              }}>
                ${therapist?.wallet_balance || 0}
              </div>
              <div style={{
                color: "#666",
                fontSize: "0.9rem"
              }}>
                Wallet Balance
              </div>
            </div>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#4CAF50",
              padding: "3px"
            }}>
              <img
                src={therapist?.profile_picture || avatar}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid white"
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: "#ffebee",
          border: "1px solid #ffcdd2",
          color: "#c62828",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: "2rem",
        height: "calc(100vh - 300px)"
      }}>
        {/* Left Column: Calendar */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          {/* Calendar Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            padding: "1rem",
            background: "#4CAF50",
            borderRadius: "8px",
            color: "white"
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              ← Previous
            </button>
            
            <h3 style={{
              margin: 0,
              fontSize: "1.3rem",
              fontWeight: "500"
            }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <button
              onClick={() => navigateMonth(1)}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "1px",
            background: "#e0e0e0",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} style={{
                padding: "1rem 0.5rem",
                textAlign: "center",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#666",
                background: "#f5f5f5"
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
                  onMouseEnter={(e) => {
                    if (day) {
                      setHoveredDate(dateStr);
                      e.target.style.background = "#e8f5e8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    setHoveredDate(null);
                    if (day) {
                      e.target.style.background = day ? 
                        (isToday ? "#4CAF50" :
                         daySessions.length > 0 ? "#81C784" :
                         "white") : "#f9f9f9";
                    }
                  }}
                  style={{
                    minHeight: "60px",
                    padding: "0.5rem",
                    background: day ? 
                      (isToday ? "#4CAF50" :
                       daySessions.length > 0 ? "#81C784" :
                       "white") : "#f9f9f9",
                    cursor: day ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    color: day ? (isToday || daySessions.length > 0 ? "white" : "#333") : "#999",
                    transition: "background 0.2s ease"
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
                          fontSize: "0.9rem",
                          fontWeight: isToday ? "600" : "normal"
                        }}>
                          {day}
                        </span>
                      </div>
                      
                      {daySessions.length > 0 && (
                        <div style={{
                          fontSize: "0.7rem",
                          textAlign: "center",
                          marginTop: "0.25rem"
                        }}>
                          {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Session Details */}
          {hoveredDate && calendarSessions[hoveredDate] && (
            <div style={{
              marginTop: "2rem",
              padding: "1rem",
              background: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #e0e0e0"
            }}>
              <h4 style={{
                margin: "0 0 1rem 0",
                color: "#2E7D32",
                fontSize: "1.1rem"
              }}>
                Sessions on {new Date(hoveredDate).toLocaleDateString()}
              </h4>
              {calendarSessions[hoveredDate].map((session) => (
                <div key={session.id} style={{
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  background: "white",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.25rem"
                  }}>
                    <strong style={{ color: "#2E7D32" }}>{session.start_time}</strong>
                    <span style={{
                      background: "#e8f5e8",
                      color: "#2E7D32",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.8rem"
                    }}>
                      {session.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    {session.patient_name} • {session.duration} min • ${session.fee}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Therapist Info & Patients */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          {/* Therapist Info Card */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1rem 0",
              color: "#2E7D32",
              fontSize: "1.2rem",
              fontWeight: "600"
            }}>
              About Me
            </h3>
            
            {therapist?.about_note && (
              <p style={{
                margin: "0 0 1rem 0",
                color: "#666",
                fontSize: "0.9rem",
                lineHeight: "1.5"
              }}>
                {therapist.about_note}
              </p>
            )}

            {therapist?.area_of_expertise && (
              <div>
                <h4 style={{
                  margin: "0 0 0.75rem 0",
                  color: "#333",
                  fontSize: "1rem",
                  fontWeight: "500"
                }}>
                  Specialties
                </h4>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem"
                }}>
                  {therapist.area_of_expertise.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: "#e8f5e8",
                        color: "#2E7D32",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Patients Section */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            flex: 1,
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem"
            }}>
              <h3 style={{
                margin: 0,
                color: "#2E7D32",
                fontSize: "1.2rem",
                fontWeight: "600"
              }}>
                My Patients
              </h3>
              <span style={{
                background: "#e8f5e8",
                color: "#2E7D32",
                padding: "0.25rem 0.75rem",
                borderRadius: "12px",
                fontSize: "0.8rem",
                fontWeight: "500"
              }}>
                {patients.length} patient{patients.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div style={{
              maxHeight: "400px",
              overflowY: "auto"
            }}>
              {patientsLoading ? (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "150px",
                  color: "#666"
                }}>
                  Loading patients...
                </div>
              ) : patients.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  color: "#666",
                  padding: "2rem 1rem"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
                  No patients yet
                </div>
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "1rem",
                      marginBottom: "0.75rem",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#e8f5e8";
                      e.target.style.borderColor = "#4CAF50";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#f8f9fa";
                      e.target.style.borderColor = "#e9ecef";
                    }}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "#4CAF50",
                      padding: "2px",
                      marginRight: "1rem"
                    }}>
                      <img
                        src={patient.profile_picture || avatar}
                        alt={patient.full_name || `${patient.first_name} ${patient.last_name}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: "500",
                        color: "#333",
                        fontSize: "0.95rem",
                        marginBottom: "0.25rem"
                      }}>
                        {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                      </div>
                      
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        fontSize: "0.8rem",
                        color: "#666"
                      }}>
                        <span>{patient.session_count || 0} sessions</span>
                        {patient.last_session_date && (
                          <span>
                            Last: {new Date(patient.last_session_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {patient.tags && patient.tags.length > 0 && (
                        <div style={{
                          display: "flex",
                          gap: "0.25rem",
                          marginTop: "0.5rem"
                        }}>
                          {patient.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              style={{
                                background: "rgba(76, 175, 80, 0.1)",
                                color: "#2E7D32",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "10px",
                                fontSize: "0.7rem"
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {patient.tags.length > 2 && (
                            <span style={{
                              color: "#666",
                              fontSize: "0.7rem",
                              padding: "0.2rem"
                            }}>
                              +{patient.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}