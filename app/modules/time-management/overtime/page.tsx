"use client";

import { useEffect, useState } from "react";
import CreateOvertimeRuleForm from "../components/CreateOvertimeRuleForm";
import OvertimeRuleList from "../components/OvertimeRuleList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { OvertimeRule } from "../types";
import { deleteOvertime, getOvertime } from "../api";

export default function OvertimeRulePage() {
  const [overtimerules, setOvertimeRules] = useState<OvertimeRule[]>([]);
  const [loading, setLoading] = useState(true);

  const token = "YOUR_TOKEN_HERE"; // temporary

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOvertime(token);
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
    await deleteOvertime(id, token);
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
