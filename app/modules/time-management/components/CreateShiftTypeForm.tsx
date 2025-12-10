"use client";

import { useState } from "react";
import { createShiftType } from "../api";
import s from "../page.module.css";

interface CreateShiftTypeFormProps {
  onCreated: () => void;
}

export default function CreateShiftTypeForm({ onCreated }: CreateShiftTypeFormProps) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;
    if (!token) return console.error("No token found. Please log in.");

    setLoading(true);
    try {
      await createShiftType({
        name,
        active,
      }, token);

      // this is the default btw :)
      setName(""); setActive(true);

      onCreated();
    }
    catch (err) {console.error("Error creating shifttype:", err);}
    finally {setLoading(false);}
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
      <div className={s.field}>
        
        <label className={s.description}>ShiftType Name  </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
         <label className={s.description}>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Active</label>
      <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
      </div>
    </div>
  </form>
  );
}