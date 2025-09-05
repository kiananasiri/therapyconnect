import React, { useState, useEffect } from "react";
import avatar from "../assets/avatar.png"; // ✅ use local asset

// Mock data for now
const mockTherapist = {
  name: "Dr. Alice Smith",
  profilePic: avatar,
  about: "I am a licensed therapist specializing in Cognitive Behavioral Therapy.",
  expertise: ["Cognitive Therapy", "Stress Management", "Anxiety"],
  wallet: 320, // mock balance in USD
};

const mockReviews = [
  { id: 1, patient: "John Doe", text: "Very helpful and kind!", rating: 5 },
  { id: 2, patient: "Jane Roe", text: "Great session, felt understood.", rating: 4 },
];

const mockPayments = [
  { id: 1, patient: "John Doe", amount: 50, status: "Completed" },
  { id: 2, patient: "Jane Roe", amount: 75, status: "Completed" },
];

const mockSessions = [
  { id: 1, date: "2025-09-05", time: "10:00 AM - 11:00 AM", patient: "John Doe" },
  { id: 2, date: "2025-09-12", time: "2:00 PM - 3:00 PM", patient: "Jane Roe" },
];

export default function TherapistDashboard() {
  const [sessions] = useState(mockSessions);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Join button logic (mocked)
  const [canJoin, setCanJoin] = useState(false);
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const upcoming = sessions.find((s) => s.date === today);
    if (upcoming) {
      setCanJoin(true);
    }
  }, [sessions]);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Therapist Dashboard</h1>
        {/* ✅ Wallet in top-right */}
        <div
          style={{
            background: "#f7f7f7",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Wallet: ${mockTherapist.wallet}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        {/* Left Column: Profile */}
        <div>
          <img
            src={mockTherapist.profilePic}
            alt="Profile"
            style={{ width: "120px", borderRadius: "50%" }}
          />
          <h2>{mockTherapist.name}</h2>
          <p>{mockTherapist.about}</p>
          <div>
            <strong>Expertise:</strong>
            <ul>
              {mockTherapist.expertise.map((tag, i) => (
                <li key={i}>{tag}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Reviews + Payments */}
        <div>
          <h3>Latest Reviews</h3>
          <ul>
            {mockReviews.map((r) => (
              <li key={r.id}>
                ⭐ {r.rating} – {r.patient}: "{r.text}"
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: "1rem" }}>Latest Payments</h3>
          <ul>
            {mockPayments.map((p) => (
              <li key={p.id}>
                {p.patient}: ${p.amount} ({p.status})
              </li>
            ))}
          </ul>

          {/* Session controls */}
          <div style={{ marginTop: "1rem" }}>
            <button
              disabled={!canJoin}
              style={{ marginRight: "1rem", padding: "0.5rem 1rem" }}
            >
              {canJoin ? "Join Session" : "Join (Not Available Yet)"}
            </button>
            <button style={{ padding: "0.5rem 1rem", background: "red", color: "white" }}>
              Cancel Session
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div style={{ marginTop: "2rem" }}>
        <h3>Upcoming Sessions</h3>
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
                {daySessions.length > 0 && <div style={{ color: "green" }}>●</div>}
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
                  {s.time} – with {s.patient}
                </p>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

