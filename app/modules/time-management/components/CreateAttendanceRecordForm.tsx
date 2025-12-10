"use client";

import { useState } from "react";
import { createAttendanceRecord } from "../api";
import s from "../page.module.css";
import { Punch } from "../types";

interface CreateAttendanceRecordFormProps {
  onCreated: () => void;
}

export default function CreateAttendanceRecordForm({ onCreated }: CreateAttendanceRecordFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [punches, setPunches] = useState<Punch[]>([]);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState<number | undefined>();
  const [hasMissedPunch, setHasMissedPunch] = useState<boolean>(false);
  const [exceptionIds, setExceptionIds] = useState<string[]>([]);
  const [finalisedForPayroll, setFinalisedForPayroll] = useState<boolean>(false);
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
    await createAttendanceRecord({
      employeeId,
      punches: punches.length > 0 ? punches : undefined,
      totalWorkMinutes,
      hasMissedPunch,
      exceptionIds: exceptionIds.length > 0 ? exceptionIds : undefined,
      finalisedForPayroll
    }, token);

      // Reset form fields
      setEmployeeId("");
      setPunches([]);
      setTotalWorkMinutes(undefined);
      setHasMissedPunch(false);
      setExceptionIds([]);
      setFinalisedForPayroll(false);

      onCreated(); // reload attendance records
    } catch (err) {
      console.error("Error creating attendance record:", err);
    } finally {
      setLoading(false);
    }
  };

  /*
  export interface CreateAttendanceRecordDto {
    employeeId: string;
    punches?: Punch[];
    totalWorkMinutes?: number;
    hasMissedPunch?: boolean;
    exceptionIds?: string[];
    finalisedForPayroll?: boolean;
  }

  */
  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Employee ID</label>
          <input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />

          <label className={s.description}>Punches (optional, comma separated time:type)</label>
          <input type="text" value={punches.map(p => `${p.time}:${p.type}`).join(",")} 
                 onChange={e => setPunches(e.target.value.split(",").map(p => { const [time,type] = p.split(":"); return {time, type:type as "in"|"out"}; }))} />

          <label className={s.description}>Total Work Minutes (optional)</label>
          <input type="number" value={totalWorkMinutes} onChange={e => setTotalWorkMinutes(Number(e.target.value))} />

          <label className={s.description}>Has Missed Punch</label>
          <input type="checkbox" checked={hasMissedPunch} onChange={e => setHasMissedPunch(e.target.checked)} />

          <label className={s.description}>Exception IDs (optional, comma separated)</label>
          <input type="text" value={exceptionIds.join(",")} onChange={e => setExceptionIds(e.target.value.split(",").map(id => id.trim()))} />

          <label className={s.description}>Finalised for Payroll</label>
          <input type="checkbox" checked={finalisedForPayroll} onChange={e => setFinalisedForPayroll(e.target.checked)} />

          <button className={s.button} disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
        </div>
      </div>
    </form>
  );
}