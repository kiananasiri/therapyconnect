import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function Auth() {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === "patient") {
      if (!form.fullName || !form.phone || !form.password) {
        alert("Please fill all required fields");
        return;
      }
      setUser({ role, name: form.fullName, phone: form.phone });
      navigate("/dashboard/patient");
    } else {
      if (!form.email || !form.password) {
        alert("Therapist login requires email & password");
        return;
      }
      setUser({ role, name: form.email });
      navigate("/dashboard/therapist");
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{role === "patient" ? "Patient Signup / Login" : "Therapist Login"}</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setRole("patient")} disabled={role === "patient"}>
          Patient
        </button>
        <button
          onClick={() => setRole("therapist")}
          disabled={role === "therapist"}
          style={{ marginLeft: "1rem" }}
        >
          Therapist
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        {role === "patient" && (
          <>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              style={{ display: "block", margin: "0.5rem auto", padding: "0.5rem" }}
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              style={{ display: "block", margin: "0.5rem auto", padding: "0.5rem" }}
            />
          </>
        )}

        {role === "therapist" && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={{ display: "block", margin: "0.5rem auto", padding: "0.5rem" }}
          />
        )}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ display: "block", margin: "0.5rem auto", padding: "0.5rem" }}
        />

        <button type="submit" style={{ marginTop: "1rem", padding: "0.75rem 1.5rem" }}>
          {role === "patient" ? "Sign Up / Login" : "Login"}
        </button>
      </form>
    </div>
  );
}

