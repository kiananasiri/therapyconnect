import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getPatient } from '../api';

const PatientProfile = () => {
  const { user } = useUser();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!user || !user.id) {
        setError('No patient ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getPatient(user.id);
        setPatient(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching patient profile:', error);
        setError('Failed to load patient profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientProfile();
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
          <p>Loading your profile...</p>
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
          <p>No patient profile found</p>
        </div>
      </div>
    );
  }

  // Helper function to format sex
  const formatSex = (sex) => {
    const sexMap = {
      'M': 'Male',
      'F': 'Female',
      'O': 'Other',
      'P': 'Prefer not to say'
    };
    return sexMap[sex] || sex;
  };

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EBE5D9 0%, #CCBBDB 50%, #EBE5D9 100%)",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto"
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
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {/* Profile Picture */}
            <div style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: patient.profile_picture 
                ? `url(${patient.profile_picture})` 
                : "linear-gradient(135deg, #4CAF50, #8BC34A)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
              color: "white",
              border: "4px solid rgba(158, 131, 184, 0.2)"
            }}>
              {!patient.profile_picture && "👤"}
            </div>
            
            {/* Basic Info */}
            <div style={{ flex: 1 }}>
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
                {patient.first_name} {patient.last_name}
              </h1>
              <p style={{
                margin: "0 0 1rem 0",
                fontSize: "1.2rem",
                color: "#666",
                fontFamily: "'Times New Roman', serif"
              }}>
                Patient ID: {patient.id}
              </p>
              <div style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  fontFamily: "'Times New Roman', serif"
                }}>
                  📧 {patient.email}
                </div>
                {patient.phone_no && (
                  <div style={{
                    background: "linear-gradient(135deg, #2196F3, #64B5F6)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    fontFamily: "'Times New Roman', serif"
                  }}>
                    📞 {patient.phone_no}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem"
        }}>
          {/* Personal Information */}
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
              👤 Personal Information
            </h3>
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
                  Age
                </div>
                <div style={{
                  color: "#666",
                  fontFamily: "'Times New Roman', serif"
                }}>
                  {calculateAge(patient.date_of_birth)} years old
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
                  Gender
                </div>
                <div style={{
                  color: "#666",
                  fontFamily: "'Times New Roman', serif"
                }}>
                  {formatSex(patient.sex)}
                </div>
              </div>
              {patient.address && (
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
                    Address
                  </div>
                  <div style={{
                    color: "#666",
                    fontFamily: "'Times New Roman', serif"
                  }}>
                    {patient.address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
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
              🏥 Medical Information
            </h3>
            <div style={{
              background: "rgba(255, 87, 34, 0.1)",
              padding: "1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 87, 34, 0.2)"
            }}>
              <div style={{
                fontWeight: "600",
                color: "#333",
                fontFamily: "'Times New Roman', serif",
                marginBottom: "0.5rem"
              }}>
                Allergies & Medications
              </div>
              <div style={{
                color: "#666",
                fontFamily: "'Times New Roman', serif",
                lineHeight: "1.5"
              }}>
                {patient.allergies_and_medication || 'No allergies or medications specified'}
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {patient.tags && patient.tags.length > 0 && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
            border: "1px solid rgba(158, 131, 184, 0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#9C27B0",
              fontFamily: "'Times New Roman', serif"
            }}>
              🏷️ Tags
            </h3>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}>
              {patient.tags.map((tag, index) => (
                <span key={index} style={{
                  background: "linear-gradient(135deg, #9C27B0, #E1BEE7)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  border: "1px solid rgba(156, 39, 176, 0.2)",
                  fontFamily: "'Times New Roman', serif"
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        {patient.about_note && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
            border: "1px solid rgba(158, 131, 184, 0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#607D8B",
              fontFamily: "'Times New Roman', serif"
            }}>
              📝 About Me
            </h3>
            <p style={{
              color: "#333",
              lineHeight: "1.6",
              margin: 0,
              fontFamily: "'Times New Roman', serif"
            }}>
              {patient.about_note}
            </p>
          </div>
        )}

        {/* Additional Notes */}
        {patient.added_note && (
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
              color: "#795548",
              fontFamily: "'Times New Roman', serif"
            }}>
              📄 Additional Notes
            </h3>
            <p style={{
              color: "#333",
              lineHeight: "1.6",
              margin: 0,
              fontFamily: "'Times New Roman', serif"
            }}>
              {patient.added_note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
