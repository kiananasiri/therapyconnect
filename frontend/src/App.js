import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import TherapistDashboard from "./pages/TherapistDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import TherapistSettings from "./pages/TherapisSettings.jsx";
import PatientSettings from "./pages/PateintSettings.jsx";
import TherapistList from "./pages/TherapistList";
import TherapistDetail from "./pages/TherapistDetail";

import { UserProvider } from "./contexts/UserContext";
import Navbar from "./components/Navbar";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard/patient" element={<PatientDashboard />} />
          <Route path="/dashboard/therapist" element={<TherapistDashboard />} />
          <Route path="/therapists" element={<TherapistList />} />
          <Route path="/therapists/:id" element={<TherapistDetail />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

