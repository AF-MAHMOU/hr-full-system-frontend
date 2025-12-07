import { Holiday } from "../types";
import s from "../page.module.css";

interface HolidayListProps {
  holidays: Holiday[];
  onDelete: (id: string) => void;
}

export default function HolidayList({ holidays, onDelete }: HolidayListProps) {
  if (!holidays.length) return <p>No holidays found</p>;

  return (
    <div className={s.holidayContainer}>
      {holidays.map((holiday) => (
        <div key={holiday.id} className={s.holidayCard}>
          <h4 className={s.header}>{holiday.name}</h4>
          <p className={s.description}>
            Holiday Start: {holiday.startDate} 
          </p>

          <p className={s.description}>
            Holiday Start: {holiday.endDate} 
          </p>
          
          <button className={s.button} onClick={() => onDelete(holiday.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
