"use client";

import { useState } from "react";
import { createShiftAssignmentByDepartment } from "../api";
import s from "../page.module.css";

interface CreateShiftAssignmentDepartmentFormProps {
  onCreated: () => void;
}

export default function CreateShiftAssignmentDepartmentForm({ onCreated }: CreateShiftAssignmentDepartmentFormProps) {
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
      await createShiftAssignmentByDepartment({ name }, token);
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
