"use client";

import { useState } from "react";
import { createTimeException } from "../api";
import s from "../page.module.css";

interface CreateTimeExceptionFormProps {
  onCreated: () => void;
}

export default function CreateTimeExceptionForm({ onCreated }: CreateTimeExceptionFormProps) {
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
      await createTimeException({ name }, token);
      setName("");
      onCreated(); // reload timeexceptions
    } catch (err) {
      console.error("Error creating timeexception:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ marginTop: "20px" }}>
      <h3 className={s.description}>Create TimeException</h3>

      <input
        type="text"
        placeholder="Time Exception name"
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
