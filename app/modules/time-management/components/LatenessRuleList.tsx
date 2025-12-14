import { LatenessRule } from "../types";
import s from "../page.module.css";

interface LatenessRuleListProps {
  latenessrules: LatenessRule[];
  onDelete: (id: string) => void;
}

export default function LatenessRuleList({ latenessrules, onDelete }: LatenessRuleListProps) {
  if (!latenessrules.length) return <p>No latenessrules found</p>;

  /*
  export interface LatenessRule {
  id: string;
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
  active: boolean;
  }
  */

  return (
    <div className={s.cardcontainer}>
      {latenessrules.map((rule) => (
        <div key={rule.id} className={s.Card}>
          <h4 className={s.header}>{rule.name}</h4>

          {rule.description && (
            <p className={s.description}>
              Description: {rule.description}
            </p>
          )}

          <p className={s.description}>
            Grace Period: {rule.gracePeriodMinutes} minutes
          </p>

          <p className={s.description}>
            Deduction per Minute: {rule.deductionForEachMinute}
          </p>

          <p className={s.description}>
            Active? {rule.active ? "Yes" : "No"}
          </p>

          <button
            className={s.button}
            onClick={() => onDelete(rule.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}