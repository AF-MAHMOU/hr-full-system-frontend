"use client";

import { useEffect, useState } from "react";
import { Shift } from "../types";
import s from "../page.module.css";
import { getAllShifts, deleteShift } from "../api/index";

export default function ShiftList() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllShifts();
      setShifts(data);
    } catch (err) {
      console.error("Failed to load shifts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!id) return;
    await deleteShift(id);
    load();
  };

  if (loading) return <p>Loading shifts...</p>;
  if (!shifts.length) return <p>No shifts found</p>;
  
  return (
    <div className={s.cardcontainer}>
      {shifts.map((shift, index) => (
  <div key={shift.id || shift.name || `shift-${index}`} className={s.Card}>
          <h4 className={s.header}>{shift.name}</h4>
          
          <p className={s.description}>
            Active? {shift.active ? "Yes" : "No"}
          </p>

          <p className={s.description}>
            Start Time: {shift.startTime}
          </p>

          <p className={s.description}>
            End Time: {shift.endTime}
          </p>

          <p className={s.description}>
            Grace In: {shift.graceInMinutes} minutes
          </p>

          <p className={s.description}>
            Grace Out: {shift.graceOutMinutes} minutes
          </p>

          <p className={s.description}>
            Requires Overtime Approval? {shift.requiresApprovalForOvertime ? "Yes" : "No"}
          </p>

          <p className={s.description}>
            Punch Policy: {shift.punchPolicy}
          </p>

          <button className={s.button} onClick={() => handleDelete(shift.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
