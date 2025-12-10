"use client";

import { useEffect, useState } from "react";
import CreateScheduleRuleForm from "../components/CreateScheduleRuleForm";
import ScheduleRuleList from "../components/ScheduleRuleList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";
import { deleteSchedule, getAllSchedule } from "../api/time-managementApi";
import { ScheduleRule } from "../types";

export default function ScheduleRulePage() {
  const [schedulerules, setScheduleRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);

  const token = "YOUR_TOKEN_HERE"; // temporary

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllSchedule(token);
      setScheduleRules(data);
    } catch (err) {
      console.error("Error fetching schedulerules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteSchedule(id, token);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>ScheduleRules</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ScheduleRuleList schedulerules={schedulerules} onDelete={handleDelete} />
          <CreateScheduleRuleForm onCreated={load} />
        </>
      )}
    </div>
  );
}
