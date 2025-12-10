import { AttendanceRecord } from "../types";
import s from "../page.module.css";

interface AttendanceRecordListProps {
  attendancerecords: AttendanceRecord[];
  onDelete: (id: string) => void;
}

/*
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: string[];
  finalisedForPayroll: boolean;
}
*/
export default function AttendanceRecordList({ attendancerecords, onDelete }: AttendanceRecordListProps) {
  if (!attendancerecords.length) return <p>No attendancerecords found</p>;

  return (
    <div className={s.attendancerecordContainer}>
      {attendancerecords.map((attendancerecord) => (
        <div key={attendancerecord.id} className={s.Card}>
          {/*Balabizo*/}
          <p className={s.description}>
            Employee ID: {attendancerecord.employeeId}
          </p>

          <p className={s.description}>
            Total Work Minutes: {attendancerecord.totalWorkMinutes}
          </p>

          <p className={s.description}>
            Missed Punch? {attendancerecord.hasMissedPunch ? "Yes" : "No"}
          </p>

          <p className={s.description}>
            Finalised For Payroll? {attendancerecord.finalisedForPayroll ? "Yes" : "No"}
          </p>

          <div className={s.description}>
            Punches:
            <ul>
              {attendancerecord.punches.map((p, i) => (
                <li key={i}>
                  {new Date(p.timestamp).toLocaleString()} - {p.type}
                </li>
              ))}
            </ul>
          </div>


          <button className={s.button} onClick={() => onDelete(attendancerecord.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
