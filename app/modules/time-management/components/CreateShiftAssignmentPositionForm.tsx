"use client";

import { useState } from "react";
import { createShiftAssignmentByPosition } from "../api";
import s from "../page.module.css";

interface CreateShiftAssignmentPositionFormProps {
  onCreated: () => void;
}

export default function CreateShiftAssignmentPositionForm({ onCreated }: CreateShiftAssignmentPositionFormProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }

    setLoading(true);
    try {
      await createShiftAssignmentByPosition({ name }, token);
      setName("");
      onCreated(); // reload shiftassignments
    } catch (err) {
      console.error("Error creating shiftassignment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: "20px" }}>
      <h3 className={s.description}>Create ShiftAssignment</h3>

      <input
        type="text"
        placeholder="ShiftAssignment name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <button className={s.button} disabled={loading}>
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
