import React, { useState, useEffect } from "react";
import { getTherapist, getTherapistPatients, getTherapistCalendarSessions, cancelSession } from "../api";
import { useUser } from "../contexts/UserContext";
import avatar from "../assets/avatar.png"; // ✅ use local asset

export default function TherapistDashboard() {
  const { user } = useUser();
  const [therapist, setTherapist] = useState(null);
  const [patients, setPatients] = useState([]);
  const [calendarSessions, setCalendarSessions] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSessions, setPatientSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayViewSessions, setDayViewSessions] = useState([]);
  const [cancelingSession, setCancelingSession] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get therapist ID from user context
  const therapistId = user?.id;

  // Handle session cancellation
  const handleCancelSession = async (sessionId) => {
    if (isCancelling) return; // Prevent double-clicks
    
    try {
      setIsCancelling(true);
      console.log('🔄 Cancelling session:', sessionId, 'with reason:', cancelReason);
      
      const response = await cancelSession(sessionId, therapistId, cancelReason);
      console.log('✅ Cancellation response:', response);
      
      // Show success message
      alert(`Session cancelled successfully! ${response.data.refund_processed ? 'Refund processed.' : ''}`);
      
      // Refresh data
      if (selectedPatient) {
        await handlePatientClick(selectedPatient);
      }
      
      // Refresh calendar data
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const sessionsResponse = await getTherapistCalendarSessions(therapistId, year, month);
      setCalendarSessions(sessionsResponse.data.sessions);
      
      // Close modal and reset state
      setShowCancelModal(false);
      setCancelReason('');
      setCancelingSession(null);
      
    } catch (error) {
      console.error('❌ Error cancelling session:', error);
      const errorMessage = error.response?.data?.error || 'Failed to cancel session';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  };

  // Open cancel modal
  const openCancelModal = (sessionId) => {
    setCancelingSession(sessionId);
    setShowCancelModal(true);
    setCancelReason('');
  };

  // Close cancel modal
  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelingSession(null);
    setCancelReason('');
  };

  // Check if session can be cancelled (24 hours before and not completed/cancelled)
  const canCancelSession = (session) => {
    if (session.status === 'completed' || session.status === 'cancelled') {
      return false;
    }
    
    const sessionTime = new Date(session.scheduled_start_datetime);
    const now = new Date();
    const timeDifference = sessionTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);
    
    return hoursDifference >= 24; // Must be at least 24 hours before
  };

  // Fetch therapist data and dashboard info
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!therapistId) {
        setError('No therapist ID found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch therapist profile
        const therapistResponse = await getTherapist(therapistId);
        setTherapist(therapistResponse.data);
        
        // Fetch calendar sessions for current month
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const sessionsResponse = await getTherapistCalendarSessions(therapistId, year, month);
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
  }, [currentDate, therapistId]);

  // Fetch patients data separately
  useEffect(() => {
    const fetchPatients = async () => {
      if (!therapistId) return;

      try {
        setPatientsLoading(true);
        const patientsResponse = await getTherapistPatients(therapistId);
        setPatients(patientsResponse.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, [therapistId]);

  // Handle patient selection and fetch their sessions
  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient);
    setSessionLoading(true);
    
    try {
      // Fetch sessions for this specific patient with this therapist
      const response = await fetch(`http://localhost:8000/api/sessions/?therapist_id=${therapistId}&patient_id=${patient.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const sessions = await response.json();
      console.log('📊 Sessions data:', sessions);
      
      // Ensure sessions is an array before sorting
      if (Array.isArray(sessions)) {
        // Sort sessions by date (most recent first)
        const sortedSessions = sessions.sort((a, b) => 
          new Date(b.scheduled_start_datetime) - new Date(a.scheduled_start_datetime)
        );
        
        setPatientSessions(sortedSessions);
        console.log(`✅ Loaded ${sortedSessions.length} sessions for ${patient.first_name} ${patient.last_name}`);
      } else {
        console.error('❌ Sessions data is not an array:', sessions);
        setPatientSessions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching patient sessions:', error);
      setPatientSessions([]);
    } finally {
      setSessionLoading(false);
    }
  };

  // Close patient modal
  const closePatientModal = () => {
    setSelectedPatient(null);
    setPatientSessions([]);
  };

  // Handle day selection for day view
  const handleDayClick = (day, dateStr) => {
    if (!day) return; // Don't open for empty calendar cells
    
    const sessions = calendarSessions[dateStr] || [];
    setSelectedDay({
      date: dateStr,
      day: day,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear()
    });
    setDayViewSessions(sessions);
  };

  // Close day view modal
  const closeDayView = () => {
    setSelectedDay(null);
    setDayViewSessions([]);
  };

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
                  onClick={() => handleDayClick(day, dateStr)}
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
                    onClick={() => handlePatientClick(patient)}
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
                      e.currentTarget.style.background = "#e8f5e8";
                      e.currentTarget.style.borderColor = "#4CAF50";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8f9fa";
                      e.currentTarget.style.borderColor = "#e9ecef";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
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

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div style={{
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
            closePatientModal();
          }
        }}
        >
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "800px",
            maxWidth: "90%",
            maxHeight: "80%",
            overflow: "auto"
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #e0e0e0"
            }}>
              <h2 style={{
                margin: 0,
                color: "#2E7D32",
                fontSize: "1.5rem",
                fontWeight: "600"
              }}>
                👤 {selectedPatient.full_name || `${selectedPatient.first_name} ${selectedPatient.last_name}`}
              </h2>
              <button
                onClick={closePatientModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0.5rem"
                }}
              >
                ×
              </button>
            </div>

            {/* Patient Info Section */}
            <div style={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem"
            }}>
              <h3 style={{
                margin: "0 0 1rem 0",
                color: "#333",
                fontSize: "1.2rem"
              }}>
                Patient Information
              </h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem"
              }}>
                <div>
                  <strong style={{ color: "#2E7D32" }}>Total Sessions:</strong>
                  <div>{selectedPatient.session_count || 0}</div>
                </div>
                <div>
                  <strong style={{ color: "#2E7D32" }}>Last Session:</strong>
                  <div>
                    {selectedPatient.last_session_date 
                      ? new Date(selectedPatient.last_session_date).toLocaleDateString()
                      : "No sessions yet"
                    }
                  </div>
                </div>
                {selectedPatient.tags && selectedPatient.tags.length > 0 && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong style={{ color: "#2E7D32" }}>Tags:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      {selectedPatient.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            background: "rgba(76, 175, 80, 0.1)",
                            color: "#2E7D32",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            marginRight: "0.5rem",
                            display: "inline-block"
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sessions History Section */}
            <div>
              <h3 style={{
                margin: "0 0 1rem 0",
                color: "#333",
                fontSize: "1.2rem"
              }}>
                Session History
              </h3>

              {sessionLoading ? (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "200px",
                  color: "#666"
                }}>
                  <div style={{
                    width: "30px",
                    height: "30px",
                    border: "3px solid #f3f3f3",
                    borderTop: "3px solid #4CAF50",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: "1rem"
                  }}></div>
                  Loading sessions...
                </div>
              ) : patientSessions.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  color: "#666",
                  padding: "2rem",
                  background: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
                  No sessions found
                </div>
              ) : (
                <div style={{
                  maxHeight: "300px",
                  overflowY: "auto"
                }}>
                  {patientSessions.map((session) => (
                    <div
                      key={session.id}
                      style={{
                        background: "white",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "1rem",
                        marginBottom: "0.75rem"
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem"
                      }}>
                        <div style={{
                          fontSize: "1rem",
                          fontWeight: "500",
                          color: "#333"
                        }}>
                          {new Date(session.scheduled_start_datetime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <span style={{
                          background: session.status === 'completed' ? "#e8f5e8" : 
                                     session.status === 'scheduled' ? "#e3f2fd" :
                                     session.status === 'cancelled' ? "#ffebee" : "#f5f5f5",
                          color: session.status === 'completed' ? "#2E7D32" : 
                                session.status === 'scheduled' ? "#1976d2" :
                                session.status === 'cancelled' ? "#c62828" : "#666",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "500"
                        }}>
                          {session.status}
                        </span>
                      </div>
                      
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: "#666"
                      }}>
                        <div>
                          <strong>Time:</strong> {new Date(session.scheduled_start_datetime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div>
                          <strong>Duration:</strong> {session.duration} min
                        </div>
                        <div>
                          <strong>Fee:</strong> ${session.fee}
                        </div>
                        {session.patient_rating && (
                          <div>
                            <strong>Rating:</strong> {session.patient_rating}/10
                          </div>
                        )}
                      </div>
                      
                      {session.therapist_notes && (
                        <div style={{
                          marginTop: "0.75rem",
                          padding: "0.75rem",
                          background: "#f8f9fa",
                          borderRadius: "6px"
                        }}>
                          <strong style={{ color: "#2E7D32", fontSize: "0.9rem" }}>Therapist Notes:</strong>
                          <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                            {session.therapist_notes}
                          </div>
                        </div>
                      )}
                      
                      {/* Cancel Session Button */}
                      {canCancelSession(session) && (
                        <div style={{
                          marginTop: "0.75rem",
                          display: "flex",
                          justifyContent: "flex-end"
                        }}>
                          <button
                            onClick={() => openCancelModal(session.id)}
                            disabled={cancelingSession === session.id}
                            style={{
                              background: "#dc3545",
                              color: "white",
                              border: "none",
                              padding: "0.5rem 1rem",
                              borderRadius: "6px",
                              fontSize: "0.9rem",
                              cursor: cancelingSession === session.id ? "not-allowed" : "pointer",
                              opacity: cancelingSession === session.id ? 0.6 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem"
                            }}
                          >
                            {cancelingSession === session.id ? (
                              <>
                                <span>⏳</span>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <span>❌</span>
                                Cancel Session
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Session cannot be cancelled message */}
                      {session.status === 'scheduled' && !canCancelSession(session) && (
                        <div style={{
                          marginTop: "0.75rem",
                          padding: "0.5rem",
                          background: "#fff3cd",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          color: "#856404"
                        }}>
                          ⚠️ Sessions can only be cancelled at least 24 hours in advance
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day View Modal */}
      {selectedDay && (
        <div style={{
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
            closeDayView();
          }
        }}
        >
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            width: "700px",
            maxWidth: "90%",
            maxHeight: "80%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid #e0e0e0"
            }}>
              <h2 style={{
                margin: 0,
                color: "#2E7D32",
                fontSize: "1.5rem",
                fontWeight: "600"
              }}>
                📅 {new Date(selectedDay.year, selectedDay.month, selectedDay.day).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <button
                onClick={closeDayView}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0.5rem"
                }}
              >
                ×
              </button>
            </div>

            {/* Day Schedule */}
            <div style={{
              flex: 1,
              overflow: "auto",
              position: "relative"
            }}>
              {dayViewSessions.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  color: "#666",
                  padding: "4rem 2rem",
                  background: "#f8f9fa",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>No sessions scheduled</h3>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>This day is free for new appointments</p>
                </div>
              ) : (
                <div style={{
                  position: "relative",
                  minHeight: "600px"
                }}>
                  {/* Hour Grid */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = i + 8; // Start from 8 AM
                    const hour12 = hour > 12 ? hour - 12 : hour;
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour12 === 0 ? 12 : hour12;
                    
                    return (
                      <div
                        key={hour}
                        style={{
                          position: "absolute",
                          top: `${i * 50}px`,
                          left: 0,
                          right: 0,
                          height: "50px",
                          borderBottom: "1px solid #e0e0e0",
                          display: "flex",
                          alignItems: "flex-start"
                        }}
                      >
                        <div style={{
                          width: "80px",
                          fontSize: "0.8rem",
                          color: "#666",
                          textAlign: "right",
                          paddingRight: "1rem",
                          paddingTop: "0.25rem"
                        }}>
                          {displayHour}:00 {ampm}
                        </div>
                        <div style={{
                          flex: 1,
                          height: "100%",
                          position: "relative"
                        }} />
                      </div>
                    );
                  })}

                  {/* Sessions */}
                  {dayViewSessions.map((session) => {
                    const startTime = new Date(`2000-01-01T${session.start_time}:00`);
                    const startHour = startTime.getHours();
                    const startMinute = startTime.getMinutes();
                    
                    // Calculate position (8 AM = 0, so subtract 8 from hour)
                    const topPosition = ((startHour - 8) * 50) + (startMinute / 60 * 50);
                    const height = Math.max((session.duration / 60) * 50, 30); // Minimum 30px height
                    
                    // Only show sessions that fall within our 8 AM - 8 PM range
                    if (startHour < 8 || startHour >= 20) return null;
                    
                    return (
                      <div
                        key={session.id}
                        style={{
                          position: "absolute",
                          top: `${topPosition}px`,
                          left: "90px",
                          right: "10px",
                          height: `${height}px`,
                          background: session.status === 'completed' ? 
                            "linear-gradient(135deg, #4CAF50, #66BB6A)" : 
                            session.status === 'scheduled' ?
                            "linear-gradient(135deg, #2196F3, #42A5F5)" :
                            "linear-gradient(135deg, #FF9800, #FFB74D)",
                          borderRadius: "8px",
                          color: "white",
                          padding: "0.5rem",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          zIndex: 1
                        }}
                        onClick={() => {
                          // Find patient and open patient modal
                          const patient = patients.find(p => p.id === session.patient_id);
                          if (patient) {
                            closeDayView();
                            handlePatientClick(patient);
                          }
                        }}
                      >
                        <div style={{
                          fontWeight: "600",
                          fontSize: "0.9rem",
                          marginBottom: "0.25rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {session.patient_name}
                        </div>
                        <div style={{
                          fontSize: "0.8rem",
                          opacity: "0.9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <span>{session.start_time}</span>
                          <span>{session.duration} min</span>
                        </div>
                        <div style={{
                          fontSize: "0.7rem",
                          opacity: "0.8",
                          marginTop: "0.25rem"
                        }}>
                          ${session.fee} • {session.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e0e0e0",
              textAlign: "center",
              color: "#666",
              fontSize: "0.9rem"
            }}>
              Click on a session to view patient details
            </div>
          </div>
        </div>
      )}

      {/* Cancel Session Modal */}
      {showCancelModal && (
        <div style={{
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
        }}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "2rem",
            width: "90%",
            maxWidth: "500px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.5rem"
            }}>
              <span style={{ fontSize: "1.5rem", marginRight: "0.5rem" }}>❌</span>
              <h3 style={{ margin: 0, color: "#dc3545" }}>Cancel Session</h3>
            </div>
            
            <p style={{ 
              margin: "0 0 1.5rem 0", 
              color: "#666",
              lineHeight: "1.5"
            }}>
              Are you sure you want to cancel this session? This action cannot be undone. 
              If the session was paid for, the payment will be refunded to the patient.
            </p>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#333"
              }}>
                Cancellation Reason (Optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this session..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
                maxLength={500}
              />
              <div style={{
                fontSize: "0.8rem",
                color: "#666",
                textAlign: "right",
                marginTop: "0.25rem"
              }}>
                {cancelReason.length}/500 characters
              </div>
            </div>
            
            <div style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end"
            }}>
              <button
                onClick={closeCancelModal}
                disabled={isCancelling}
                style={{
                  background: "#f8f9fa",
                  color: "#666",
                  border: "1px solid #ddd",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: isCancelling ? "not-allowed" : "pointer",
                  opacity: isCancelling ? 0.6 : 1
                }}
              >
                Keep Session
              </button>
              <button
                onClick={() => handleCancelSession(cancelingSession)}
                disabled={isCancelling}
                style={{
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: isCancelling ? "not-allowed" : "pointer",
                  opacity: isCancelling ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                {isCancelling ? (
                  <>
                    <span>⏳</span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <span>❌</span>
                    Cancel Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}