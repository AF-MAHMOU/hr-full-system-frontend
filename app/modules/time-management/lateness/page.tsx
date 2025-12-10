"use client";

import { useEffect, useState } from "react";
import LatenessRuleList from "../components/LatenessRuleList";
import s from "../page.module.css";
import { LatenessRule } from "../types";
import { deleteLatenessRule, getAllLatenessRule } from "../api";
import CreateLatenessRuleForm from "../components/CreateLatenessRuleForm";

export default function LatenessRulePage() {
  const [latenessrules, setLatenessRules] = useState<LatenessRule[]>([]);
  const [loading, setLoading] = useState(true);

  const token = "YOUR_TOKEN_HERE"; // temporary

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllLatenessRule(token);
      setLatenessRules(data);
    } catch (err) {
      console.error("Error fetching latenessrules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteLatenessRule(id, token);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>LatenessRules</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <LatenessRuleList latenessrules={latenessrules} onDelete={handleDelete} />
          <CreateLatenessRuleForm onCreated={load} />
        </>
      )}
    </div>
  );
}
