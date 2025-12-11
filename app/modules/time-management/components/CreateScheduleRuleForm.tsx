"use client";

import { useState } from "react";
import s from "../page.module.css";
import { createSchedule } from '../api/index';

interface CreateScheduleRuleFormProps {
  onCreated: () => void;
}

export default function CreateScheduleRuleForm({ onCreated }: CreateScheduleRuleFormProps) {
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    /*
export interface CreateScheduleRuleDto {
  name: string;
  pattern: string;
  active?: boolean;
}
    */
    setLoading(true);
    try {
      await createSchedule({
        name,
        pattern,
        active,
      });

      // this is the default btw :)
      setName(""); setPattern(""); setActive(true);

      onCreated();
    }
    catch (err) {console.error("Error creating schedule Rule:", err);}
    finally {setLoading(false);}
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
      <div className={s.field}>
        <label className={s.description}>Schedule Rule Name</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        
      <label className={s.description}>Pattern</label>
      <input type="text" value={pattern} onChange={e => setPattern(e.target.value)} required />
        
      <label className={s.description}>
        <input
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
        Active
      </label>

      <button className={s.button} disabled={loading}>{loading ? "Adding..." : "Add"}</button>
      </div>
    </div>
  </form>
  );
}