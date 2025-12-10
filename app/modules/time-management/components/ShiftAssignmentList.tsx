import { ShiftAssignment } from "../types";
import s from "../page.module.css";

interface ShiftAssignmentListProps {
  scope: AssignmentScope;
  scopeId: string;
  shiftassignments: ShiftAssignment[];
  onDelete: (id: string, type: "employee" | "position" | "department") => void;
}

type AssignmentScope = "employee" | "department" | "position";

export default function ShiftAssignmentList({
  scope,
  scopeId,
  shiftassignments,
  onDelete,
}: ShiftAssignmentListProps) {
  const filtered = shiftassignments.filter((sa) => {
    switch (scope) {
      case "employee":
        return sa.employeeId === scopeId;
      case "department":
        return sa.departmentId === scopeId;
      case "position":
        return sa.positionId === scopeId;
    }
  });

  if (!filtered.length) return <p>No shift assignments found</p>;

  return (
    <div className={s.shiftassignmentContainer}>
      {filtered.map((sa) => (
        <div key={sa.id} className={s.Card}>
          <h4 className={s.header}>{sa.shiftId}</h4>

          <p className={s.description}>
            Starts on: {new Date(sa.startDate).toLocaleDateString()}
          </p>

          <p className={s.description}>
            Ends on: {sa.endDate ? new Date(sa.endDate).toLocaleDateString() : "N/A"}
          </p>

          <p className={s.description}>
            Status: {sa.status}
          </p>

          <button className={s.button} onClick={() => onDelete(sa.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
