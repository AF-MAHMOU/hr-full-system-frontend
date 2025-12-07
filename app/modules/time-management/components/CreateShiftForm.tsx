"use client";

import { useState } from "react";
import { createShift } from "../api";
import s from "../page.module.css";

interface CreateShiftFormProps {
  onCreated: () => void;
}

export default function CreateShiftForm({ onCreated }: CreateShiftFormProps) {
  const [name, setName] = useState("");
  const [shiftType, setShiftType] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [graceIn, setGraceIn] = useState(0);
  const [graceOut, setGraceOut] = useState(0);
  const [requiresOvertimeApproval, setRequiresOvertimeApproval] = useState(false);
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
      await createShift({
        name,
        shiftType,
        startTime,
        endTime,
        punchPolicy: "STANDARD",
        graceInMinutes: graceIn,
        graceOutMinutes: graceOut,
        requiresApprovalForOvertime: requiresOvertimeApproval,
        active,
      }, token);

      // this is the default btw :)
      setName(""); setShiftType(""); setStartTime("09:00"); setEndTime("17:00");
      setGraceIn(0); setGraceOut(0); setRequiresOvertimeApproval(false); setActive(true);

      onCreated();
    }
    catch (err) {console.error("Error creating shift:", err);}
    finally {setLoading(false);}
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
      <div className={s.field}>
        <label className={s.description}>Shift Name  </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        <label className={s.description}>Shift Type  </label>
        <input type="text" value={shiftType} onChange={e => setShiftType(e.target.value)} required />
        <label className={s.description}>Start Time  </label>
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <label className={s.description}>End Time </label>
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
        <label className={s.description}>Grace In (min) </label>
        <input type="number" value={graceIn} onChange={e => setGraceIn(Number(e.target.value))} />
        <label className={s.description}>Grace Out (min) </label>
        <input type="number" value={graceOut} onChange={e => setGraceOut(Number(e.target.value))} />
         <label className={s.description}>
          <input type="checkbox" checked={requiresOvertimeApproval} onChange={e => setRequiresOvertimeApproval(e.target.checked)} />
          Requires Overtime Approval
         </label>
         <label className={s.description}>
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />Active</label>
      <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
      </div>
    </div>
  </form>
  );
}