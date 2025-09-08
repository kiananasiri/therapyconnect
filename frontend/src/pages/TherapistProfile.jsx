import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getTherapist } from '../api';

const TherapistProfile = () => {
  const { user } = useUser();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTherapistProfile = async () => {
      if (!user || !user.id) {
        setError('No therapist ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getTherapist(user.id);
        setTherapist(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching therapist profile:', error);
        setError('Failed to load therapist profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistProfile();
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

  if (!therapist) {
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
          <p>No therapist profile found</p>
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
              background: therapist.profile_picture 
                ? `url(${therapist.profile_picture})` 
                : "linear-gradient(135deg, #9E83B8, #CCBBDB)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "4rem",
              color: "white",
              border: "4px solid rgba(158, 131, 184, 0.2)"
            }}>
              {!therapist.profile_picture && "👨‍⚕️"}
            </div>
            
            {/* Basic Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{
                margin: "0 0 0.5rem 0",
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #9E83B8, #758976)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontFamily: "'Times New Roman', serif"
              }}>
                Dr. {therapist.first_name} {therapist.last_name}
              </h1>
              <p style={{
                margin: "0 0 1rem 0",
                fontSize: "1.2rem",
                color: "#666",
                fontFamily: "'Times New Roman', serif"
              }}>
                Therapist ID: {therapist.id}
              </p>
              <div style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap"
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #9E83B8, #CCBBDB)",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  fontFamily: "'Times New Roman', serif"
                }}>
                  📧 {therapist.email}
                </div>
                {therapist.phone_no && (
                  <div style={{
                    background: "linear-gradient(135deg, #758976, #9E83B8)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    fontFamily: "'Times New Roman', serif"
                  }}>
                    📞 {therapist.phone_no}
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
          gap: "2rem"
        }}>
          {/* Education */}
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
              color: "#758976",
              fontFamily: "'Times New Roman', serif"
            }}>
              🎓 Education
            </h3>
            {therapist.education && therapist.education.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {therapist.education.map((edu, index) => (
                  <div key={index} style={{
                    background: "rgba(158, 131, 184, 0.1)",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(158, 131, 184, 0.2)"
                  }}>
                    <div style={{
                      fontWeight: "600",
                      color: "#333",
                      fontFamily: "'Times New Roman', serif"
                    }}>
                      {typeof edu === 'object' ? `${edu.degree} in ${edu.field}` : edu}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ 
                color: "#666", 
                fontStyle: "italic",
                fontFamily: "'Times New Roman', serif"
              }}>
                No education information available
              </p>
            )}
          </div>

          {/* Area of Expertise */}
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
              color: "#758976",
              fontFamily: "'Times New Roman', serif"
            }}>
              🧠 Areas of Expertise
            </h3>
            {therapist.area_of_expertise && therapist.area_of_expertise.length > 0 ? (
              <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem"
              }}>
                {therapist.area_of_expertise.map((expertise, index) => (
                  <span key={index} style={{
                    background: "linear-gradient(135deg, #CCBBDB, #EBE5D9)",
                    color: "#333",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    border: "1px solid rgba(158, 131, 184, 0.2)",
                    fontFamily: "'Times New Roman', serif"
                  }}>
                    {expertise}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ 
                color: "#666", 
                fontStyle: "italic",
                fontFamily: "'Times New Roman', serif"
              }}>
                No expertise areas specified
              </p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {therapist.bio && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "2rem",
            marginTop: "2rem",
            boxShadow: "0 8px 32px rgba(158, 131, 184, 0.1)",
            border: "1px solid rgba(158, 131, 184, 0.1)"
          }}>
            <h3 style={{
              margin: "0 0 1.5rem 0",
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#758976",
              fontFamily: "'Times New Roman', serif"
            }}>
              📝 Biography
            </h3>
            <p style={{
              color: "#333",
              lineHeight: "1.6",
              margin: 0,
              fontFamily: "'Times New Roman', serif"
            }}>
              {therapist.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistProfile;
