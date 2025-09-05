import React from "react";
import { useParams } from "react-router-dom";

export default function TherapistDetail() {
  const { id } = useParams();

  return (
    <div>
      <h1>Therapist Detail</h1>
      <p>Details about therapist with ID: {id}</p>
      <p>Overview, bio, availability, and booking option will go here.</p>
    </div>
  );
}

