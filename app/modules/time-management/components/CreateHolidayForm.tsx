"use client";

import { useState } from "react";
import { createHoliday } from "../api";
import s from "../page.module.css";

interface CreateHolidayFormProps {
  onCreated: () => void;
}

export default function CreateHolidayForm({ onCreated }: CreateHolidayFormProps) {
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
      await createHoliday({ name }, token);
      setName("");
      onCreated(); // reload holidays
    } catch (err) {
      console.error("Error creating holiday:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: "20px" }}>
      <h3 className={s.description}>Create Holiday</h3>

      <input
        type="text"
        placeholder="Holiday name"
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
