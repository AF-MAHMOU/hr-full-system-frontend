"use client";

import { useEffect, useState } from "react";
import CreateShiftTypeForm from "../components/CreateShiftTypeForm";
import ShiftTypeList from "../components/ShiftTypeList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { ShiftType } from "../types";
import { deleteShiftType, getAllShiftsType } from "../api";

export default function ShiftTypePage() {
  const [shifttypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [loading, setLoading] = useState(true);

  const token = "YOUR_TOKEN_HERE"; // temporary

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllShiftsType(token);
      setShiftTypes(data);
    } catch (err) {
      console.error("Error fetching shifttypes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteShiftType(id, token);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>ShiftTypes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ShiftTypeList shifttypes={shifttypes} onDelete={handleDelete} />
          <CreateShiftTypeForm onCreated={load} />
        </>
      )}
    </div>
  );
}
