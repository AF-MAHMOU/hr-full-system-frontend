"use client";

import { useState } from "react";
import { createAttendanceCorrection } from "../api";
import s from "../page.module.css";

interface CreateAttendanceCorrectionFormProps {
  onCreated: () => void;
}

export default function CreateAttendanceCorrectionForm({ onCreated }: CreateAttendanceCorrectionFormProps) {
    const [employeeId, setEmployeeId] = useState(""),
    [attendanceRecordId, setAttendanceRecordId] = useState(""),
    [reason, setReason] = useState(""),
    [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return console.error("No token found. Please log in.");
    setLoading(true);
    try {
      await createAttendanceCorrection({ employeeId, attendanceRecordId, reason: reason || undefined }, token);
      setEmployeeId(""); setAttendanceRecordId(""); setReason("");
      onCreated();
    } catch (err) { console.error("Error creating attendance correction:", err); }
    finally { setLoading(false); }
  };


  /*
  export interface CreateAttendanceCorrectionRequestDto {
  employeeId: string;
  attendanceRecordId: string;
  reason?: string;
}
  */

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee ID</label>
          <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />
          <label className={s.description}>Attendance Record ID</label>
          <input type="text" value={attendanceRecordId} onChange={e => setAttendanceRecordId(e.target.value)} required />
          <label className={s.description}>Reason (optional)</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} />
          <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
        </div>
      </div>
    </form>
  );
}