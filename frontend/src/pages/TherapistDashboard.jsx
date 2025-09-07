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
    <div style={{ padding: "2rem", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1>Therapist Dashboard</h1>
        <div
          style={{
            background: "#f7f7f7",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Wallet: ${therapist?.wallet_balance || 0}
        </div>
      </div>

      {/* Main Content: 3 Columns */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "300px 1fr 350px", 
        gap: "2rem",
        flex: 1,
        overflow: "hidden"
      }}>
        {/* Left Column: Profile */}
        <div style={{
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <img
            src={therapist?.profile_picture || avatar}
            alt="Profile"
            style={{ 
              width: "120px", 
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "1rem"
            }}
          />
          <h2 style={{ margin: "0 0 1rem 0", textAlign: "center" }}>
            {therapist ? `${therapist.first_name} ${therapist.last_name}` : "Loading..."}
          </h2>
          <p style={{ textAlign: "center", fontSize: "14px", color: "#666", marginBottom: "1rem" }}>
            {therapist?.about_note || ""}
          </p>
          {therapist?.area_of_expertise && (
            <div style={{ width: "100%" }}>
              <strong style={{ fontSize: "14px" }}>Expertise:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {therapist.area_of_expertise.map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      background: "#e3f2fd",
                      color: "#1976d2",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "12px",
                      fontSize: "12px",
                      margin: "0.25rem 0.25rem 0 0"
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
          background: "#fff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid #e0e0e0"
        }}>
          {/* Calendar Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                background: "#f0f0f0",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              ← Prev
            </button>
            <h3 style={{ margin: 0 }}>
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              style={{
                background: "#f0f0f0",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", marginBottom: "1rem" }}>
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{
                padding: "0.5rem",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "12px",
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
              
              return (
                <div
                  key={index}
                  onMouseEnter={() => day && setHoveredDate(dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    minHeight: "60px",
                    padding: "0.5rem",
                    border: "1px solid #e0e0e0",
                    background: day ? "#fff" : "#f9f9f9",
                    cursor: day ? "pointer" : "default",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {day && (
                    <>
                      <span style={{ fontSize: "14px", fontWeight: day ? "500" : "normal" }}>
                        {day}
                      </span>
                      {daySessions.length > 0 && (
                        <div style={{
                          width: "8px",
                          height: "8px",
                          background: "#4caf50",
                          borderRadius: "50%",
                          position: "absolute",
                          top: "4px",
                          right: "4px"
                        }} />
                      )}
                      {daySessions.length > 0 && (
                        <div style={{ fontSize: "10px", color: "#4caf50", marginTop: "auto" }}>
                          {daySessions.length} session{daySessions.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hover details */}
          {hoveredDate && calendarSessions[hoveredDate] && (
            <div style={{ 
              padding: "1rem", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              background: "#f9f9f9"
            }}>
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Sessions on {hoveredDate}</h4>
              {calendarSessions[hoveredDate].map((session) => (
                <div key={session.id} style={{ 
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                  fontSize: "14px"
                }}>
                  <strong>{session.start_time}</strong> - {session.patient_name}
                  <br />
                  <span style={{ color: "#666" }}>
                    {session.duration} min • ${session.fee} • {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Patient List */}
        <div style={{
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "12px",
          overflowY: "auto"
        }}>
          <h3 style={{ margin: "0 0 1rem 0" }}>My Patients ({patients.length})</h3>
          <div>
            {patients.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px" }}>No patients found</p>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  style={{
                    background: "#fff",
                    padding: "1rem",
                    marginBottom: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                    <img
                      src={patient.profile_picture || avatar}
                      alt={patient.full_name}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: "0.75rem"
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: "500", fontSize: "14px" }}>
                        {patient.full_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {patient.session_count} session{patient.session_count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  {patient.last_session_date && (
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Last session: {new Date(patient.last_session_date).toLocaleDateString()}
                    </div>
                  )}
                  {patient.tags && patient.tags.length > 0 && (
                    <div style={{ marginTop: "0.5rem" }}>
                      {patient.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            display: "inline-block",
                            background: "#fff3e0",
                            color: "#f57c00",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "8px",
                            fontSize: "10px",
                            margin: "0.125rem 0.125rem 0 0"
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
      </div>
    </div>
  );
}

