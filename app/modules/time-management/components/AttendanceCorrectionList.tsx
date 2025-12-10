import { AttendanceCorrectionRequest } from "../types";
import s from "../page.module.css";

interface AttendanceCorrectionRequestListProps {
  attendancecorrectionrequests: AttendanceCorrectionRequest[];
  onDelete: (id: string) => void;
}

export default function AttendanceCorrectionRequestList({
  attendancecorrectionrequests,
  onDelete,
}: AttendanceCorrectionRequestListProps) {
  if (!attendancecorrectionrequests.length) return <p>No attendance correction requests found</p>;

  return (
    <div className={s.attendancecorrectionrequestContainer}>
      {attendancecorrectionrequests.map((request) => (
        <div key={request.id} className={s.Card}>
          <h4 className={s.header}>Employee ID: {request.employeeId}</h4>

          {request.reason && (
            <p className={s.description}>
              Reason: {request.reason}
            </p>
          )}

          <p className={s.description}>
            Status: {request.status}
          </p>

          <button
            className={s.button}
            onClick={() => onDelete(request.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
