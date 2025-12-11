"use client";

import { useState } from "react";
import { createOvertime } from '../api/index';
import s from "../page.module.css";

interface CreateOvertimeRuleFormProps {
  onCreated: () => void;
}

export default function CreateOvertimeRuleForm({ onCreated }: CreateOvertimeRuleFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [approved, setApproved] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createOvertime(
        {
          name,
          description,
          active,
          approved,
        }
      );

      // Reset form to default values
      setName("");
      setDescription("");
      setActive(true);
      setApproved(false);

      onCreated();
    } catch (err) {
      console.error("Error creating overtime rule:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Overtime Rule Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className={s.description}>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className={s.description}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>

          <label className={s.description}>
            <input
              type="checkbox"
              checked={approved}
              onChange={(e) => setApproved(e.target.checked)}
            />
            Approved
          </label>

          <button className={s.button} disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}
