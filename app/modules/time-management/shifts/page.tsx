"use client";

import { useEffect, useState } from "react";
import CreateShiftForm from "../components/CreateShiftForm";
import ShiftList from "../components/ShiftList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { deleteShift, getAllShifts } from '../api/index';
import { Shift } from "../types";

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllShifts();
      setShifts(data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
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
          <ShiftList shifts={shifts} onDelete={handleDelete} />
          <CreateShiftForm onCreated={load} />
          <div style={{ marginTop: "3rem" }}>
            <Calendar shifts={shifts} />
          </div>
        </>
      )}
    </div>
  );
}
