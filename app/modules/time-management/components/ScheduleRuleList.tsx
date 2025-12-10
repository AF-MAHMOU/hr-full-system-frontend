import { ScheduleRule } from "../types";
import s from "../page.module.css";

interface ScheduleRuleListProps {
  schedulerules: ScheduleRule[];
  onDelete: (id: string) => void;
}

export default function ScheduleRuleList({ schedulerules, onDelete }: ScheduleRuleListProps) {
  if (!schedulerules.length) return <p>No schedulerules found</p>;

  /*
  export interface ScheduleRule {
  id: string;
  name: string;
  pattern: string;
  active: boolean;
}
  */
  return (
    <div className={s.scheduleruleContainer}>
      {schedulerules.map((schedulerule) => (
        <div key={schedulerule.id} className={s.Card}>
          <h4 className={s.header}>{schedulerule.name}</h4>

          <p className={s.description}>
            Type: {schedulerule.pattern} 
          </p>

          <p className={s.description}>
            Active? {schedulerule.active} 
          </p>
          
          <button className={s.button} onClick={() => onDelete(schedulerule.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
