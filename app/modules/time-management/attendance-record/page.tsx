"use client";

import { useEffect, useState } from "react";
import CreateAttendanceRecordForm from "../components/CreateAttendanceRecordForm";
import AttendanceRecordList from "../components/AttendanceRecordList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { deleteAttendanceRecord, getAllAttendanceRecord } from '../api/time-managementApiNoToken';
import { AttendanceRecord } from "../types";

export default function AttendanceRecordPage() {
  const [attendancerecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const token = "YOUR_TOKEN_HERE"; // temporary

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAttendanceRecord(token);
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
    await deleteAttendanceRecord(id, token);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>AttendanceRecords</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <AttendanceRecordList attendancerecords={attendancerecords} onDelete={handleDelete} />
          <CreateAttendanceRecordForm onCreated={load} />
        </>
      )}
    </div>
  );
}
