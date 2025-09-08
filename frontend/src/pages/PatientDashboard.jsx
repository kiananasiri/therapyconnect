import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { getPatient, getPatientSessions, getPatientPayments } from "../api";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";

export default function PatientDashboard() {
  const { user } = useUser();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!user || !user.id) {
        setError('No patient ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch patient profile
        const patientResponse = await getPatient(user.id);
        setPatient(patientResponse.data);

        // Fetch patient sessions
        const sessionsResponse = await getPatientSessions(user.id);
        setSessions(sessionsResponse.data || []);

        // Fetch patient payments
        try {
          const paymentsResponse = await getPatientPayments(user.id);
          setPayments(paymentsResponse.data || []);
        } catch (paymentError) {
          console.warn('Could not fetch payments:', paymentError);
          setPayments([]);
        }

        setError(null);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setError('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #EBE5D9 0%, #CCBBDB 50%, #EBE5D9 100%)",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Times New Roman', serif"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔄</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #EBE5D9 0%, #CCBBDB 50%, #EBE5D9 100%)",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Times New Roman', serif"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem", color: "#d32f2f" }}>⚠️</div>
          <p style={{ color: "#d32f2f", margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #EBE5D9 0%, #CCBBDB 50%, #EBE5D9 100%)",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "'Times New Roman', serif"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>👤</div>
          <p>No patient data found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EBE5D9 0%, #CCBBDB 50%, #EBE5D9 100%)",
      padding: "2rem"
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "24px",
        padding: "2.5rem",
        marginBottom: "2rem",
        boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
        border: "1px solid rgba(158, 131, 184, 0.1)"
      }}>
        <div style={{ 
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h1 style={{
              margin: "0 0 0.5rem 0",
              fontSize: "2.5rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Times New Roman', serif"
            }}>
              Welcome, {patient.first_name}!
            </h1>
            <p style={{
              margin: 0,
              color: "#A2ABA1",
              fontSize: "1.2rem",
              fontWeight: "400",
              fontFamily: "'Times New Roman', serif"
            }}>
              Your health journey continues today
            </p>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem"
          }}>
            <div style={{
              textAlign: "right",
              padding: "1.25rem 1.75rem",
              background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
              borderRadius: "20px",
              color: "white",
              fontFamily: "'Times New Roman', serif"
            }}>
              <div style={{
                fontSize: "1.4rem",
                fontWeight: "700"
              }}>
                ${patient.wallet_balance || 0}
              </div>
              <div style={{
                fontSize: "1rem",
                opacity: "0.9",
                fontWeight: "500"
              }}>
                Wallet Balance
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Left Column: Profile Info */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
          border: "1px solid rgba(158, 131, 184, 0.1)",
          height: "fit-content"
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: patient.profile_picture 
                ? `url(${patient.profile_picture})` 
                : "linear-gradient(135deg, #4CAF50, #8BC34A)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              color: "white",
              border: "4px solid rgba(76, 175, 80, 0.2)",
              margin: "0 auto 1rem"
            }}>
              {!patient.profile_picture && "👤"}
            </div>
            <h2 style={{
              margin: "0 0 0.5rem 0",
              fontSize: "1.8rem",
              fontWeight: "600",
              color: "#333",
              fontFamily: "'Times New Roman', serif"
            }}>
              {patient.first_name} {patient.last_name}
            </h2>
            <p style={{
              margin: 0,
              color: "#666",
              fontSize: "1rem",
              fontFamily: "'Times New Roman', serif"
            }}>
              Patient ID: {patient.id}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{
              background: "rgba(76, 175, 80, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(76, 175, 80, 0.2)"
            }}>
              <div style={{
                fontWeight: "600",
                color: "#333",
                fontFamily: "'Times New Roman', serif",
                marginBottom: "0.25rem"
              }}>
                📧 Email
              </div>
              <div style={{
                color: "#666",
                fontFamily: "'Times New Roman', serif"
              }}>
                {patient.email}
              </div>
            </div>

            <div style={{
              background: "rgba(76, 175, 80, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(76, 175, 80, 0.2)"
            }}>
              <div style={{
                fontWeight: "600",
                color: "#333",
                fontFamily: "'Times New Roman', serif",
                marginBottom: "0.25rem"
              }}>
                📞 Phone
              </div>
              <div style={{
                color: "#666",
                fontFamily: "'Times New Roman', serif"
              }}>
                {patient.phone_no}
              </div>
            </div>

            {patient.about_note && (
              <div style={{
                background: "rgba(76, 175, 80, 0.1)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)"
              }}>
                <div style={{
                  fontWeight: "600",
                  color: "#333",
                  fontFamily: "'Times New Roman', serif",
                  marginBottom: "0.5rem"
                }}>
                  📝 About Me
                </div>
                <div style={{
                  color: "#666",
                  fontFamily: "'Times New Roman', serif",
                  lineHeight: "1.5"
                }}>
                  {patient.about_note}
                </div>
              </div>
            )}

            {patient.tags && patient.tags.length > 0 && (
              <div style={{
                background: "rgba(76, 175, 80, 0.1)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(76, 175, 80, 0.2)"
              }}>
                <div style={{
                  fontWeight: "600",
                  color: "#333",
                  fontFamily: "'Times New Roman', serif",
                  marginBottom: "0.5rem"
                }}>
                  🏷️ Tags
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem"
                }}>
                  {patient.tags.map((tag, index) => (
                    <span key={index} style={{
                      background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      fontFamily: "'Times New Roman', serif"
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sessions + Payments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Sessions Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
            border: "1px solid rgba(158, 131, 184, 0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#4CAF50",
              fontFamily: "'Times New Roman', serif"
            }}>
              📅 Your Sessions
            </h3>
            {sessions && sessions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sessions.map((session) => (
                  <div key={session.id} style={{
                    background: "rgba(76, 175, 80, 0.1)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(76, 175, 80, 0.2)"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem"
                    }}>
                      <div style={{
                        fontWeight: "600",
                        color: "#333",
                        fontSize: "1.1rem",
                        fontFamily: "'Times New Roman', serif"
                      }}>
                        Dr. {session.therapist_first_name} {session.therapist_last_name}
                      </div>
                      <span style={{
                        background: session.status === 'completed' ? '#4CAF50' : 
                                  session.status === 'scheduled' ? '#2196F3' : 
                                  session.status === 'cancelled' ? '#f44336' : '#FF9800',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        fontFamily: "'Times New Roman', serif"
                      }}>
                        {session.status}
                      </span>
                    </div>
                    <div style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      fontFamily: "'Times New Roman', serif",
                      marginBottom: "0.25rem"
                    }}>
                      📅 {new Date(session.scheduled_start_datetime).toLocaleDateString()} at {new Date(session.scheduled_start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      fontFamily: "'Times New Roman', serif"
                    }}>
                      ⏱️ Duration: {session.duration} minutes
                    </div>
                    {session.fee && (
                      <div style={{
                        color: "#666",
                        fontSize: "0.9rem",
                        fontFamily: "'Times New Roman', serif"
                      }}>
                        💰 Fee: ${session.fee}
                      </div>
                    )}
                  </div>
                ))}
        </div>
            ) : (
              <div style={{
                  textAlign: "center",
                padding: "2rem",
                color: "#666",
                fontFamily: "'Times New Roman', serif"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📅</div>
                <p>No sessions scheduled yet</p>
              </div>
            )}
        </div>

          {/* Payments Section */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
            border: "1px solid rgba(158, 131, 184, 0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#FF5722",
              fontFamily: "'Times New Roman', serif"
            }}>
              💳 Payment History
            </h3>
            {payments && payments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {payments.map((payment) => (
                  <div key={payment.id} style={{
                    background: "rgba(255, 87, 34, 0.1)",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 87, 34, 0.2)"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem"
                    }}>
                      <div style={{
                        fontWeight: "600",
                        color: "#333",
                        fontSize: "1.1rem",
                        fontFamily: "'Times New Roman', serif"
                      }}>
                        ${payment.amount}
                      </div>
                      <span style={{
                        background: payment.status === 'completed' ? '#4CAF50' : 
                                  payment.status === 'pending' ? '#FF9800' : 
                                  payment.status === 'refunded' ? '#9E9E9E' : '#f44336',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        fontFamily: "'Times New Roman', serif"
                      }}>
                        {payment.status}
                      </span>
                    </div>
                    <div style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      fontFamily: "'Times New Roman', serif",
                      marginBottom: "0.25rem"
                    }}>
                      👨‍⚕️ Dr. {payment.therapist_first_name} {payment.therapist_last_name}
                    </div>
                    <div style={{
                      color: "#666",
                      fontSize: "0.9rem",
                      fontFamily: "'Times New Roman', serif"
                    }}>
                      📅 {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "2rem",
                color: "#666",
                fontFamily: "'Times New Roman', serif"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>💳</div>
                <p>No payment history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

