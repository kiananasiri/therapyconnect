import React, { useState, useEffect } from "react";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";

// Mock patient data
const mockPatient = {
  id: "P12345",
  name: "John Doe",
  gender: "male",
  profilePic: null,
  dob: "1990-04-12",
  phone: "+1-202-555-0147",
  aboutMe: "Looking to manage anxiety and build resilience.",
  goals: ["Reduce anxiety", "Improve sleep", "Develop coping strategies"],
  wallet: 150,
};

// Mock sessions + payments
const mockSessions = [
  { id: 1, date: "2025-09-06", time: "10:00 AM - 11:00 AM", therapist: "Dr. Alice Smith" },
  { id: 2, date: "2025-09-12", time: "2:00 PM - 3:00 PM", therapist: "Dr. Bob Johnson" },
];

const mockPayments = [
  { id: 1, amount: 50, therapist: "Dr. Alice Smith", status: "Completed", date: "2025-08-28" },
  { id: 2, amount: 75, therapist: "Dr. Bob Johnson", status: "Completed", date: "2025-08-20" },
];

export default function PatientDashboard() {
  const [sessions] = useState(mockSessions);
  const [hoveredDate, setHoveredDate] = useState(null);

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header with Wallet */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Patient Dashboard</h1>
        <div
          style={{
            background: "#f7f7f7",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Wallet: ${mockPatient.wallet}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Left Column: Profile Info */}
        <div>
          <img
            src={
              mockPatient.profilePic
                ? mockPatient.profilePic
                : mockPatient.gender === "male"
                ? avatarMale
                : avatarFemale
            }
            alt="Profile"
            style={{ width: "120px", borderRadius: "50%" }}
          />
          <h2>{mockPatient.name}</h2>
          <p><strong>ID:</strong> {mockPatient.id}</p>
          <p><strong>DOB:</strong> {mockPatient.dob}</p>
          <p><strong>Phone:</strong> {mockPatient.phone}</p>
          <p><strong>About Me:</strong> {mockPatient.aboutMe}</p>
          <div>
            <strong>Goals:</strong>
            <ul>
              {mockPatient.goals.map((goal, i) => (
                <li key={i}>{goal}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sessions + Payments */}
        <div>
          <h3>Upcoming Sessions</h3>
          <ul>
            {sessions.map((s) => (
              <li key={s.id}>
                {s.date} – {s.time} with {s.therapist}
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: "1rem" }}>Payment History</h3>
          <ul>
            {mockPayments.map((p) => (
              <li key={p.id}>
                {p.date} – ${p.amount} to {p.therapist} ({p.status})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Session Calendar</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
          {Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(1 + i);
            const dateStr = date.toISOString().split("T")[0];
            const daySessions = sessions.filter((s) => s.date === dateStr);

            return (
              <div
                key={dateStr}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                style={{
                  padding: "1rem",
                  border: "1px solid #ccc",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                {date.getDate()}
                {daySessions.length > 0 && <div style={{ color: "blue" }}>●</div>}
              </div>
            );
          })}
        </div>

        {/* Hover details */}
        {hoveredDate && (
          <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd" }}>
            <h4>Sessions on {hoveredDate}</h4>
            {sessions
              .filter((s) => s.date === hoveredDate)
              .map((s) => (
                <p key={s.id}>
                  {s.time} – with {s.therapist}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

