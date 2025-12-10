"use client";

import { useEffect, useState } from "react";
import { createShift, getAllShiftsType } from "../api";
import { ShiftType } from "../types";
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
  
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // load shift types on mount
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    console.log("All localStorage items:", Object.keys(localStorage));
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }
    
    getAllShiftsType(token)
      .then(setShiftTypes)
      .catch((err) => {
        console.error("Failed to load shift types", err);
        setError("Failed to load shift types");
      });
  }, []); // Empty dependency array means run once on mount

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get token - you already did this correctly
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    // Validate shift type selection
    if (!shiftType) {
      setError("Please select a shift type");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createShift({
        name,
        shiftType, // Make sure this is the ID (not name) - check your API!
        startTime,
        endTime,
        punchPolicy: "STANDARD",
        graceInMinutes: graceIn,
        graceOutMinutes: graceOut,
        requiresApprovalForOvertime: requiresOvertimeApproval,
        active,
      }, token);

      // Reset form
      setName("");
      setShiftType("");
      setStartTime("09:00");
      setEndTime("17:00");
      setGraceIn(0);
      setGraceOut(0);
      setRequiresOvertimeApproval(false);
      setActive(true);

      // Notify parent
      onCreated();
    } catch (err) {
      console.error("Error creating shift:", err);
      setError("Failed to create shift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Shift Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
          
          <label className={s.description}>Shift Type</label>
          {/* ✅ Fixed: Added value and onChange to select */}
          <select 
            className={s.select}
            value={shiftType}
            onChange={e => setShiftType(e.target.value)}
            required
          >
            <option value="" disabled>Select a Shift Type</option>
            {shiftTypes.map((st) => (
              // ⚠️ IMPORTANT: Check if your API expects ID or name for shiftType!
              // Usually it's ID: value={st.id}
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          <label className={s.description}>Start Time</label>
          <input 
            type="time" 
            value={startTime} 
            onChange={e => setStartTime(e.target.value)} 
            required
          />
          
          <label className={s.description}>End Time</label>
          <input 
            type="time" 
            value={endTime} 
            onChange={e => setEndTime(e.target.value)} 
            required
          />
          
          <label className={s.description}>Grace In (min)</label>
          <input 
            type="number" 
            value={graceIn} 
            onChange={e => setGraceIn(Number(e.target.value))} 
            min="0"
          />
          
          <label className={s.description}>Grace Out (min)</label>
          <input 
            type="number" 
            value={graceOut} 
            onChange={e => setGraceOut(Number(e.target.value))} 
            min="0"
          />
          
          <label className={s.description}>
            <input 
              type="checkbox" 
              checked={requiresOvertimeApproval} 
              onChange={e => setRequiresOvertimeApproval(e.target.checked)} 
            />
            Requires Overtime Approval
          </label>
          
          <label className={s.description}>
            <input 
              type="checkbox" 
              checked={active} 
              onChange={e => setActive(e.target.checked)} 
            />
            Active
          </label>
          
          <button 
            className={s.button} 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Shift"}
          </button>
        </div>
      </div>
    </form>
  );
}