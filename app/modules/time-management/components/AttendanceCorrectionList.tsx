import { AttendanceCorrectionRequest } from "../types";
import s from "../page.module.css";
import { SystemRole } from "@/shared/types";
import { useAuth } from "@/shared/hooks";

interface AttendanceCorrectionRequestListProps {
  attendancecorrectionrequests: AttendanceCorrectionRequest[];
  onDelete: (id: string) => void;
}

export default function AttendanceCorrectionRequestList({
  attendancecorrectionrequests,
  onDelete,
}: AttendanceCorrectionRequestListProps) {
  // ✅ Move hook call INSIDE the component function
  const { user } = useAuth();

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

          {(user?.roles?.includes(SystemRole.SYSTEM_ADMIN) || user?.roles?.includes(SystemRole.HR_ADMIN)) && (
            <>
              <button
                className={s.button}
                onClick={() => onDelete(request.id)}
              >
                Delete
              </button>
              <button
                className={s.button}
                onClick={() => onDelete(request.id)}
              >
                Review
              </button>
            </>

          )}
        </div>
      ))}
    </div>
  );
}