"use client";
import { useState } from "react";
import { createAttendanceRecord } from "../api/index";
import s from "../page.module.css";
import { PunchType } from "../types";
import { EmployeeProfile } from "../../hr/api/hrApi";
import Selections from "../components/Selections";

export default function EmployeeClock() {
  const [employeeId, setEmployeeId] = useState("");
  const [punchType, setPunchType] = useState<PunchType>(PunchType.IN);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);

  const handlePunch = async () => {
    if (!employeeId) {
      setMessage("Please enter your Employee ID");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Find the selected employee from the employees list
      const selectedEmployee = employees.find(emp => emp._id === employeeId);
      
      if (!selectedEmployee) {
        setMessage("Employee not found");
        setLoading(false);
        return;
      }

      const punches = [
        { type: punchType, timestamp: new Date().toISOString() },
      ];

      await createAttendanceRecord({
        employeeId,
        punches,
        finalisedForPayroll: true,
      });

      setMessage(`Attendance recorded (${punchType}) successfully`);
      setPunchType(punchType === PunchType.IN ? PunchType.OUT : PunchType.IN);
    } catch (err) {
      console.error(err);
      setMessage("Failed to record attendance. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Employee Clock In/Out</h1>
      
      <Selections
        employeeId={employeeId}
        setEmployeeId={setEmployeeId}
        employees={employees}
        setEmployees={setEmployees}
      />

      <button className={s.button} onClick={handlePunch} disabled={loading}>
        {loading ? "Processing..." : `Clock ${punchType}`}
      </button>

      {message && <p className={s.message}>{message}</p>}
    </div>
  );
}