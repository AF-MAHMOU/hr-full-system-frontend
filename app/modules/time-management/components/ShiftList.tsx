import { Shift } from "../types";
import s from "../page.module.css";

interface ShiftListProps {
  shifts: Shift[];
  onDelete: (id: string) => void;
}

export default function ShiftList({ shifts, onDelete }: ShiftListProps) {
  if (!shifts.length) return <p>No shifts found</p>;

  return (
    <div className={s.shiftContainer}>
      {shifts.map((shift) => (
        <div key={shift.id} className={s.Card}>
          <h4 className={s.header}>{shift.name}</h4>
          <p className={s.description}>
            Shift Timing: {shift.startTime} - {shift.endTime}
          </p>
          <p className={s.description}>
            Shift Policy: {shift.punchPolicy}
          </p>
          <p className={s.description}>
            Grace Period (In): {shift.graceInMinutes} Minutes
          </p>
          <p className={s.description}>
            Grace Period (Out): {shift.graceOutMinutes} Minutes
          </p>
          
          <button className={s.button} onClick={() => onDelete(shift.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
