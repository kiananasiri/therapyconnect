import React from 'react';
import { useUser } from '../contexts/UserContext';
import TherapistProfile from './TherapistProfile';
import PatientProfile from './PatientProfile';

const Profile = () => {
  const { user } = useUser();

  // If no user is logged in, show a message
  if (!user) {
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
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔐</div>
          <p>Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  // Show appropriate profile based on user role
  if (user.role === 'therapist') {
    return <TherapistProfile />;
  } else if (user.role === 'patient') {
    return <PatientProfile />;
  }

  // Fallback for unknown role
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
        <p style={{ color: "#d32f2f", margin: 0 }}>Unknown user role</p>
      </div>
    </div>
  );
};

export default Profile;
