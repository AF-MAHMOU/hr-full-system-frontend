'use client'

import { Shift, ShiftType } from "../types";
import s from "../page.module.css";
import { getShiftType } from "../api";
import React, { useEffect } from "react";

interface ShiftListProps {
  shifts: Shift[];
  shiftTypes: ShiftType[]; // pass all shift types here
  onDelete: (id: string) => void;
}

export default function ShiftList({ shifts, shiftTypes, onDelete }: ShiftListProps) {
  if (!shifts.length) return <p>No shifts found</p>;

  const [shiftTypesMap, setShiftTypesMap] = React.useState<{ [key: string]: string }>({}); 
  useEffect(() => {
    // fetch all shift types for the displayed shifts
    shifts.forEach(async (shift) => {
      if (!shiftTypesMap[shift.shiftType]) {
        const data = await getShiftType(shift.shiftType);
        if (data) {
          setShiftTypesMap(prev => ({ ...prev, [shift.shiftType]: data.name }));
        }
      }
    });
  }, [shifts]);

  return (
    <div className={s.cardcontainer}>
      {shifts.map((shift) => (
        <div key={shift.id} className={s.Card}>
          <h4 className={s.header}>{shift.name}</h4>

          <p className={s.description}>
            Shift Type Name: {shiftTypesMap[shift.shiftType] ?? "Loading..."}
          </p>
          
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

          <button className={s.button} onClick={() => onDelete(shift.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
