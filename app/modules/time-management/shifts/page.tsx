"use client";

import { useEffect, useState } from "react";
import CreateShiftForm from "../components/CreateShiftForm";
import ShiftList from "../components/ShiftList";
import { usePathname } from 'next/navigation';
import s from "../page.module.css";
import { deleteShift, getAllShifts } from "../api/time-managementApi";
import Link from "next/link";

export default function ShiftPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = "YOUR_TOKEN_HERE"; // Replace with your auth system

  const pathname = usePathname();
    const href = `${pathname}/shifts`;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllShifts(token);
      console.log("Fetched shifts:", data); // check API response
      setShifts(data);
    } catch (err) {
      console.error("Error fetching shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // <-- call the outer load function
  }, []);

  const handleDelete = async (id: string) => {
    await deleteShift(id, token);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Shifts</h1>

      <CreateShiftForm onCreated={load} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ShiftList shifts={shifts} onDelete={handleDelete} />
      )}
    </div>
  );
}
