"use client";

import { useEffect, useState } from "react";
import s from "../page.module.css";
import { AttendanceCorrectionRequest } from "../types";
import { deleteAttendanceCorrection, getAllAttendanceCorrections } from '../api/index';
import CreateAttendanceCorrectionForm from "../components/CreateAttendanceCorrectionForm";
import AttendanceCorrectionRequestList from "../components/AttendanceCorrectionList";

export default function AttendanceCorrectionRequestPage() {
  const [attendancecorrectionrequests, setAttendanceCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAttendanceCorrections();
      setAttendanceCorrectionRequests(data);
    } catch (err) {
      console.error("Error fetching attendancecorrectionrequests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteAttendanceCorrection(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Attendance Correction Requests</h1>
      <p className={s.description}>Had something that caused you to be late/absent? No worries</p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <AttendanceCorrectionRequestList attendancecorrectionrequests={attendancecorrectionrequests} onDelete={handleDelete} />
          <CreateAttendanceCorrectionForm onCreated={load} />
        </>
      )}
    </div>
  );
}
