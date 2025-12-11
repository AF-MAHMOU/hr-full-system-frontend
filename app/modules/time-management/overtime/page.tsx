"use client";

import { useEffect, useState } from "react";
import CreateOvertimeRuleForm from "../components/CreateOvertimeRuleForm";
import OvertimeRuleList from "../components/OvertimeRuleList";
import s from "../page.module.css";
import { OvertimeRule } from "../types";
import { deleteOvertime, getOvertime } from '../api/index';

export default function OvertimeRulePage() {
  const [overtimerules, setOvertimeRules] = useState<OvertimeRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOvertime();
      setOvertimeRules(data);
    } catch (err) {
      console.error("Error fetching overtimerules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteOvertime(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>OvertimeRules</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <OvertimeRuleList overtimerules={overtimerules} onDelete={handleDelete} />
          <CreateOvertimeRuleForm onCreated={load} />
        </>
      )}
    </div>
  );
}
