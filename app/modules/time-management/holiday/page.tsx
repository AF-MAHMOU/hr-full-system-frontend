"use client";

import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import s from "../page.module.css";
import { deleteHoliday, getAllHolidays } from '../api/index';
import CreateHolidayForm from "../components/CreateHolidayForm";
import HolidayList from "../components/HolidayList";
import Calendar from "../components/Calendar";

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
    const href = `${pathname}/holidays`;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllHolidays();
      console.log("Fetched holidays:", data); // check API response
      setHolidays(data);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // <-- call the outer load function
  }, []);

  const handleDelete = async (id: string) => {
    await deleteHoliday(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Holidays</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <HolidayList holidays={holidays} onDelete={handleDelete} />
      )}
      <CreateHolidayForm onCreated={load} />
    <div style={{ marginTop: "3rem" }}>
                <Calendar holidays={holidays} />
              </div>
    </div>
    
  );
}
