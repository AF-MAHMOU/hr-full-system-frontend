"use client";

import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import s from "../page.module.css";
import { deleteTimeException, getAllTimeExceptions } from "../api/time-managementApi";
import Link from "next/link";
import CreateTimeExceptionForm from "../components/CreateTimeExceptionForm";
import TimeExceptionList from "../components/TimeExceptionList";

export default function timeExceptionPage() {
  const [timeexceptions, setTimeExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = "YOUR_TOKEN_HERE"; // Replace with your auth system

  const pathname = usePathname();
    const href = `${pathname}/timeexceptions`;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllTimeExceptions(token);
      console.log("Fetched timeexceptions:", data); // check API response
      setTimeExceptions(data);
    } catch (err) {
      console.error("Error fetching timeexceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // <-- call the outer load function
  }, []);

  const handleDelete = async (id: string) => {
    await deleteTimeException(id, token);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Time-Exceptions</h1>

      <CreateTimeExceptionForm onCreated={load} />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TimeExceptionList timeexceptions={timeexceptions} onDelete={handleDelete} />
      )}
    </div>
  );
}
