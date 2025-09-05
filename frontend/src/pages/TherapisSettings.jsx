import React, { useState } from "react";
import avatarMale from "../assets/avatar-male.png";
import avatarFemale from "../assets/avatar-female.png";

export default function TherapistSettings() {
  // Mock user state
  const [gender, setGender] = useState("male");
  const [profilePic, setProfilePic] = useState(null);
  const [aboutMe, setAboutMe] = useState("I am passionate about helping people.");
  const [expertise, setExpertise] = useState(["Anxiety", "Stress Management"]);
  const [newExpertise, setNewExpertise] = useState("");
  const [noPayment, setNoPayment] = useState(false);
  const [allowedPatients, setAllowedPatients] = useState([]);
  const [patientIdInput, setPatientIdInput] = useState("");

  // Availability state
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [availability, setAvailability] = useState({
    Mon: "9:00-17:00",
    Tue: "9:00-17:00",
    Wed: "9:00-17:00",
    Thu: "9:00-17:00",
    Fri: "9:00-17:00",
    Sat: "Not available",
    Sun: "Not available",
  });

  // Handle profile pic upload
  const handlePicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  // Handle expertise add/remove
  const addExpertise = () => {
    if (newExpertise && !expertise.includes(newExpertise)) {
      setExpertise([...expertise, newExpertise]);
      setNewExpertise("");
    }
  };
  const removeExpertise = (tag) => {
    setExpertise(expertise.filter((t) => t !== tag));
  };

  // Handle patient ID add
  const addPatientId = () => {
    if (patientIdInput && !allowedPatients.includes(patientIdInput)) {
      setAllowedPatients([...allowedPatients, patientIdInput]);
      setPatientIdInput("");
    }
  };
  const removePatientId = (id) => {
    setAllowedPatients(allowedPatients.filter((pid) => pid !== id));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Therapist Settings</h1>

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

      {/* Expertise */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Areas of Expertise</h2>
        <ul>
          {expertise.map((tag) => (
            <li key={tag}>
              {tag}{" "}
              <button onClick={() => removeExpertise(tag)} style={{ marginLeft: "0.5rem" }}>
                ❌
              </button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newExpertise}
          onChange={(e) => setNewExpertise(e.target.value)}
          placeholder="Add new expertise"
        />
        <button onClick={addExpertise} style={{ marginLeft: "0.5rem" }}>
          Add
        </button>
      </section>

      {/* Certificate */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Certificate</h2>
        <p>Your certificate (approved by moderator):</p>
        <p style={{ color: "#666", fontStyle: "italic" }}>
          Certificate will be available after verification
        </p>
      </section>

      {/* No Payment Option */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>No Payment Option</h2>
        <label>
          <input
            type="checkbox"
            checked={noPayment}
            onChange={(e) => setNoPayment(e.target.checked)}
          />
          Offer free sessions to selected patients
        </label>
        {noPayment && (
          <div style={{ marginTop: "1rem" }}>
            <h4>Allowed Patients</h4>
            <ul>
              {allowedPatients.map((id) => (
                <li key={id}>
                  {id}{" "}
                  <button onClick={() => removePatientId(id)} style={{ marginLeft: "0.5rem" }}>
                    ❌
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={patientIdInput}
              onChange={(e) => setPatientIdInput(e.target.value)}
              placeholder="Enter patient ID"
            />
            <button onClick={addPatientId} style={{ marginLeft: "0.5rem" }}>
              Add
            </button>
          </div>
        )}
      </section>

      {/* Availability */}
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Availability</h2>
        {daysOfWeek.map((day) => (
          <div key={day} style={{ marginBottom: "0.5rem" }}>
            <label>
              {day}:{" "}
              <input
                type="text"
                value={availability[day]}
                onChange={(e) =>
                  setAvailability({ ...availability, [day]: e.target.value })
                }
                placeholder="e.g. 9:00-17:00 or Not available"
              />
            </label>
          </div>
        ))}
      </section>

      <button style={{ marginTop: "2rem", padding: "0.75rem 1.5rem" }}>
        Save Settings
      </button>
    </div>
  );
}

