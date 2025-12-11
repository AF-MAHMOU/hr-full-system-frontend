import { ShiftAssignmentWithType, AssignmentType } from "../types";
import s from "../page.module.css";

interface Props {
  shiftassignments: ShiftAssignmentWithType[];
  onDelete: (id: string, type: AssignmentType) => void;
}

export default function ShiftAssignmentList({ shiftassignments, onDelete }: Props) {
  if (!shiftassignments.length) return <p>No shift assignments found</p>;

  return (
    <div className={s.shiftassignmentContainer}>
      {shiftassignments.map((sa) => (
        <div key={sa.id} className={s.Card}>
          <h4 className={s.header}>{sa.shiftId}</h4>

          <p className={s.description}>
            Starts: {new Date(sa.startDate).toLocaleDateString()}
          </p>

          <p className={s.description}>
            Ends: {sa.endDate ? new Date(sa.endDate).toLocaleDateString() : "N/A"}
          </p>

          <p className={s.description}>Status: {sa.status}</p>

          <button
            className={s.button}
            onClick={() => onDelete(sa.id, sa.type)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
