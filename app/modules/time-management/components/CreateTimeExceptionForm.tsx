"use client";

import { useState } from "react";
import { createTimeException } from '../api/index';
import s from "../page.module.css";
import { TimeExceptionStatus, TimeExceptionType } from "../types";

interface CreateTimeExceptionFormProps {
  onCreated: () => void;
}

export default function CreateTimeExceptionForm({ onCreated }: CreateTimeExceptionFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [type, setType] = useState<TimeExceptionType>(TimeExceptionType.MISSED_PUNCH);
  const [attendanceRecordId, setAttendanceRecordId] = useState("");
  const [assignedTo, setAssignedTo] = useState(() => {
    if (typeof window !== "undefined") {
      const currentUser = localStorage.getItem("userId"); 
      return currentUser || "";
    }
    return "";
  });
  const [status, setStatus] = useState<TimeExceptionStatus>(TimeExceptionStatus.OPEN);
  const [reason, setReason] = useState(""); // optional
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createTimeException({
        employeeId,
        type,
        attendanceRecordId,
        assignedTo,
        status,
        reason: reason || undefined, // optional
      });

      // Reset form to defaults
      setEmployeeId("");
      setType(TimeExceptionType.MISSED_PUNCH);
      setAttendanceRecordId("");
      setAssignedTo("");
      setStatus(TimeExceptionStatus.OPEN);
      setReason("");

      onCreated();
    } catch (err) {
      console.error("Error creating time exception:", err);
    } finally {
      setLoading(false);
    }
  };

  // balabizo
  // make the IDs dropdown, lamma n7el el karsa el awel
  
  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee ID</label>
          <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />

          <label className={s.description}>Time Exception Type</label>
          <select value={type} onChange={e => setType(e.target.value as TimeExceptionType)}>
            {Object.values(TimeExceptionType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className={s.description}>Attendance Record ID</label>
          <input type="text" value={attendanceRecordId} onChange={e => setAttendanceRecordId(e.target.value)} required />

          <label className={s.description}>Assigned To</label>
          <input type="text" value={assignedTo} readOnly />

          <label className={s.description}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as TimeExceptionStatus)}>
            {Object.values(TimeExceptionStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className={s.description}>Reason (optional)</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} />

          <button className={s.button} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}
