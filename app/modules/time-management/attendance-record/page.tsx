"use client";

import { useEffect, useState } from "react";
import CreateAttendanceRecordForm from "../components/CreateAttendanceRecordForm";
import AttendanceRecordList from "../components/AttendanceRecordList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { deleteAttendanceRecord, getAllAttendanceRecord } from '../api/index';
import { AttendanceRecord } from "../types";
import { usePathname, useRouter } from "next/navigation";

export default function AttendanceRecordPage() {
  const [attendancerecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAttendanceRecord();
      setAttendanceRecords(data);
    } catch (err) {
      console.error("Error fetching attendancerecords:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteAttendanceRecord(id);
    load();
  };

  const router = useRouter();
  const pathname = usePathname();

  const gotoReportsPage = () => {
    const parts = pathname.split("/").filter(Boolean);
    parts[parts.length - 1] = "reports";
    router.push("/" + parts.join("/"));
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Attendance Records</h1>
      <p className={s.description}></p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <AttendanceRecordList attendancerecords={attendancerecords} onDelete={handleDelete} />
          <CreateAttendanceRecordForm onCreated={load} />
        </>
      )}

      <button type="button"className={s.button}onClick={gotoReportsPage}>
        Go to Reports Page
      </button>
    </div>
  );
}
