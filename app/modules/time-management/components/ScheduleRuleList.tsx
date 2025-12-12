"use client";

import { ScheduleRule } from "../types";
import s from "../page.module.css";

interface ScheduleRuleListProps {
  schedulerules: ScheduleRule[];
  onDelete: (id: string) => void;
}

const getRuleId = (r: any) => String(r?.id ?? r?._id ?? r?.scheduleRuleId ?? "");

export default function ScheduleRuleList({ schedulerules, onDelete }: ScheduleRuleListProps) {
  if (!schedulerules?.length) return <p>No schedule rules found</p>;

  return (
    <div className={s.cardcontainer}>
      {schedulerules.map((r: any, idx: number) => {
        const id = getRuleId(r);

        return (
          <div key={id || `rule-${idx}`} className={s.Card}>
            <h4 className={s.header}>{r.name}</h4>

            <p className={s.description}>Type: {r.pattern}</p>

            <p className={s.description}>Active? {r.active ? "Yes" : "No"}</p>

            <button
              className={s.button}
              disabled={!id}
              title={!id ? "This rule has no id (check API response)" : ""}
              onClick={() => {
                console.log("Deleting schedule rule:", { id, rule: r });
                if (id) onDelete(id);
              }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}


  /*
  export interface ScheduleRule {
  id: string;
  name: string;
  pattern: string;
  active: boolean;
}
  */