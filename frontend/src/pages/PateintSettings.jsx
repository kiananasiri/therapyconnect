import React, { useState } from "react";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";

export default function PatientSettings() {
  // Mock patient data
  const [gender, setGender] = useState("male");
  const [profilePic, setProfilePic] = useState(null);
  const [aboutMe, setAboutMe] = useState("I want to improve my mental health and reduce stress.");
  const [goals, setGoals] = useState(["Better sleep", "Reduce anxiety"]);
  const [newGoal, setNewGoal] = useState("");
  const [dob, setDob] = useState("1990-04-12");
  const [phone, setPhone] = useState("+1-202-555-0147");
  const [password, setPassword] = useState("");
  const [wallet] = useState(150); // mock, not editable

  // Profile pic upload
  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePic(URL.createObjectURL(file));
  };

  // Goals add/remove
  const addGoal = () => {
    if (newGoal && !goals.includes(newGoal)) {
      setGoals([...goals, newGoal]);
      setNewGoal("");
    }
  };
  const removeGoal = (goal) => {
    setGoals(goals.filter((g) => g !== goal));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Patient Settings</h1>

      {/* Profile Picture */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Profile Picture</h2>
        <img
          src={
            profilePic
              ? profilePic
              : gender === "male"
              ? avatarMale
              : avatarFemale
          }
          alt="Profile"
          style={{ width: "120px", borderRadius: "50%", display: "block" }}
        />
        <input type="file" accept="image/*" onChange={handlePicUpload} />
        <div style={{ marginTop: "0.5rem" }}>
          <label>
            Gender:{" "}
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
        </div>
      </section>

      {/* About Me */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>About Me</h2>
        <textarea
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          style={{ width: "100%", height: "80px" }}
        />
      </section>

      {/* Goals */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Goals</h2>
        <ul>
          {goals.map((g) => (
            <li key={g}>
              {g}{" "}
              <button onClick={() => removeGoal(g)} style={{ marginLeft: "0.5rem" }}>
                ❌
              </button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Add new goal"
        />
        <button onClick={addGoal} style={{ marginLeft: "0.5rem" }}>
          Add
        </button>
      </section>

      {/* Credentials */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Credentials</h2>
        <div>
          <label>
            Date of Birth:{" "}
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <label>
            Phone:{" "}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
        </div>
      </section>

      {/* Wallet */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Wallet</h2>
        <p>Balance: ${wallet}</p>
      </section>

      {/* Password Change */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Change Password</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
        />
      </section>

      <button style={{ marginTop: "2rem", padding: "0.75rem 1.5rem" }}>
        Save Settings
      </button>
    </div>
  );
}

