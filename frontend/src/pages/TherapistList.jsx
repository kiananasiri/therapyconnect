import React from "react";
import { Link } from "react-router-dom";

export default function TherapistList() {
  // placeholder data
  const therapists = [
    { id: 1, name: "Dr. Alice Smith", specialty: "Cognitive Therapy" },
    { id: 2, name: "Dr. John Doe", specialty: "Family Therapy" },
  ];

  return (
    <div>
      <h1>Therapists</h1>
      <ul>
        {therapists.map((t) => (
          <li key={t.id}>
            <Link to={`/therapists/${t.id}`}>
              {t.name} – {t.specialty}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

