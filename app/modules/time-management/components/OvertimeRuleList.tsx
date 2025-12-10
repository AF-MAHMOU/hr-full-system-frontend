import { OvertimeRule } from "../types";
import s from "../page.module.css";

interface OvertimeRuleListProps {
  overtimerules: OvertimeRule[];
  onDelete: (id: string) => void;
}

export default function OvertimeRuleList({ overtimerules, onDelete }: OvertimeRuleListProps) {
  if (!overtimerules.length) return <p>No overtimerules found</p>;

  /*
  export interface OvertimeRule {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  approved: boolean;
}
  */
  return (
    <div className={s.overtimeruleContainer}>
      {overtimerules.map((overtimerule) => (
        <div key={overtimerule.id} className={s.Card}>
          <h4 className={s.header}>{overtimerule.name}</h4>
          
          {overtimerule.description && (
            <p className={s.description}>
              description: {overtimerule.description}
            </p>
          )}

          <p className={s.description}>
            Active? {overtimerule.active} 
          </p>

          <p className={s.description}>
            Approved? {overtimerule.approved} 
          </p>
          
          <button className={s.button} onClick={() => onDelete(overtimerule.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
