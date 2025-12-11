"use client";

import { useEffect, useState } from "react";
import CreateShiftForm from "../components/CreateShiftForm";
import ShiftList from "../components/ShiftList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { deleteShift, getAllShifts, getAllShiftsType } from '../api/index'; 
import { Shift, ShiftType } from "../types";

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]); // Add state for shiftTypes
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [shiftsData, shiftTypesData] = await Promise.all([
        getAllShifts(),
        getAllShiftsType()
      ]);
      setShifts(shiftsData);
      setShiftTypes(shiftTypesData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteShift(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Shifts</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Pass shiftTypes array properly */}
          <ShiftList shifts={shifts} shiftTypes={shiftTypes} onDelete={handleDelete} />
          <CreateShiftForm onCreated={load} />
          <div style={{ marginTop: "3rem" }}>
            <Calendar shifts={shifts} />
          </div>
        </>
      )}
    </div>
  );
}