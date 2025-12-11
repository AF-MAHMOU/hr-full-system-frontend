"use client";

import { useEffect, useState } from "react";
import { createAttendanceCorrection, getAllAttendanceRecord } from '../api/index';
import s from "../page.module.css";
import { AttendanceRecord } from "../types";
import { EmployeeProfile, getAllEmployees } from "../../hr/api/hrApi";

interface CreateAttendanceCorrectionFormProps {
  onCreated: () => void;
}

export default function CreateAttendanceCorrectionForm({ onCreated }: CreateAttendanceCorrectionFormProps) {
    const [employeeId, setEmployeeId] = useState(""),
    [attendanceRecordId, setAttendanceRecordId] = useState(""),
    [reason, setReason] = useState(""),
    [loading, setLoading] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceRecord, setAttendanceRecord] = useState("");
    const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
    const [employee, setEmployee] = useState("");


    useEffect(() => {
        getAllAttendanceRecord()
          .then(setAttendanceRecords)
          .catch((err) => {
          });

          getAllEmployees()
          .then(setEmployees)
          .catch((err) => {
          });

      }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
      
    setLoading(true);
    try {
      await createAttendanceCorrection({ employeeId, attendanceRecordId, reason: reason || undefined });
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
          <select className={s.select}value={employee}onChange={e => setEmployee(e.target.value)}required>

            <option value="" disabled>Select an Employee</option>
            {employees.map((em) => (
              <option key={em._id} value={em._id}>
                {em.firstName} {em.lastName}
              </option>
            ))}
          </select>
          {/*<input type="text" value={employeeId} onChange={e => setEmployeeId(e.target.value)} required />*/}
          
          <label className={s.description}>Attendance Record</label>
          <select className={s.select} value={attendanceRecordId}
          onChange={(e) => setAttendanceRecordId(e.target.value)}required disabled={!employeeId}>

            <option value="" disabled>
              {employeeId ? "Select an Attendance Record" : "Select an Employee first"}
            </option>

            {attendanceRecords
              .filter((at) => at.employeeId === employeeId)
              .map((at) => (
                <option key={at.id} value={at.id}>
                  {/* Make the label human-friendly – tweak as you like */}
                  Record #{at.id} · {at.totalWorkMinutes} mins
                  {at.hasMissedPunch ? " · ⚠ Missing punch" : ""}
                </option>
              ))}
          </select>

          {/*<input type="text" value={attendanceRecordId} onChange={e => setAttendanceRecordId(e.target.value)} required />*/}
          
          <label className={s.description}>Reason (optional)</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} />
          
          <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
        </div>
      </div>
    </form>
  );
}